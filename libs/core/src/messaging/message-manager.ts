import {
  AutoMessageType,
  IAutoMessage,
  IAutoMessageAsyncMessageResult, IAutoMessageData
} from './i-auto-message';
import { Logger } from '../common/logger';
import { IMessageProcessor } from './i-message-processor';
import { IClientMessageTransporter, IServerMessageTransporter } from './i-client-message-transporter';
import { from, Subscription, switchMap } from 'rxjs';
import { IMessageSenderWithNoResponse } from './i-message-sender';

const WATCH_DOG_TIMEOUT = 60000;

interface IWaitResponseHandler {
  messageId?: string;
  resolve: (value: any) => void;
  reject: (reason: any) => void;
  timeoutHandle?: number;
}

export class MessageManager<T extends IAutoMessageData> implements IMessageSenderWithNoResponse<T> {
  public static create<U extends IAutoMessageData>(
    processor: IMessageProcessor,
    transporter: IServerMessageTransporter<U> | IClientMessageTransporter<U>
  ): MessageManager<U> {
    return new MessageManager(processor, transporter);
  }

  private waitForResponse = new Map<string, IWaitResponseHandler>();
  private connectorStateSubscription: Subscription | null = null;
  private messageSubscription: Subscription | null = null;

  private constructor(public processor: IMessageProcessor, public transporter: IServerMessageTransporter<T> | IClientMessageTransporter<T>) {
    this.initSubscriptions();
  }

  public async sendMessage<R>(data: T, toClientId: string | null): Promise<R> {
    return await new Promise<R>((resolve, reject) => {
      const message = this.transporter.buildMessage(data, false, toClientId);
      const handler: IWaitResponseHandler = {
        messageId: message.id,
        resolve: (value: R) => {
          this.unRegisterWaiter(handler);
          resolve(value);
        },
        reject: (reason: any) => {
          this.unRegisterWaiter(handler);
          reject(reason);
        }
      };
      this.registerWaiter(handler);

      handler.timeoutHandle = setTimeout(() => {
        const errorMessage = `Message ${handler.messageId} response wait timed out`;
        // Logger.instance.error(errorMessage);
        handler.reject(errorMessage);
      }, WATCH_DOG_TIMEOUT) as unknown as number;

      Logger.instance.log(`Sending message, id: ${handler.messageId} type: ${data.type}`);
      this.transporter.sendMessage(message, toClientId).catch((error: any) => handler.reject(error));
    });
  }

  public async sendNoResponseMessage(data: T, toClientId: string | null): Promise<void> {
    const message = this.transporter.buildMessage(data, true, toClientId);
    await this.transporter.sendMessage(message, toClientId);
  }

  public async dispose(): Promise<void> {
    this.transporter.dispose();
    if (this.connectorStateSubscription != null) {
      this.connectorStateSubscription.unsubscribe();
      this.connectorStateSubscription = null;
    }
    if (this.messageSubscription != null) {
      this.messageSubscription.unsubscribe();
      this.messageSubscription = null;
    }
  }

  private async processMessage(message: IAutoMessage<IAutoMessageData>): Promise<void> {
    if (message.data.type === AutoMessageType.AsyncMessageResult) {
      this.handleMessageResult(message as IAutoMessage<IAutoMessageAsyncMessageResult>);
      return;
    }

    if (message.id == null) {
      throw new Error('Got message with an empty id.');
    }

    try {
      let result = null;
      let ok = true;
      let error = null;
      try {
        result = await this.processor.process(message);
      } catch (e) {
        ok = false;
        error = e;
        Logger.instance.error(`MessageManager processor error: ${(e as Error)?.message}`, error);
      }
      if (!message.noResponse) {
        const responseMessage = this.transporter.buildMessage(
          { type: AutoMessageType.AsyncMessageResult, ok, result, originalMessageId: message.id, error },
          true,
          message.clientId);
        this.transporter.sendMessage(responseMessage, message.clientId).catch((error: any) => {
          Logger.instance.error('MessageManager error', error);
        });
      }
    } catch (error) {
      Logger.instance.error('MessageManager error', error);
    }
  }

  private registerWaiter(handler: IWaitResponseHandler): void {
    if (handler.messageId == null) {
      return;
    }
    this.waitForResponse.set(handler.messageId, handler);
  }

  private unRegisterWaiter(handler: IWaitResponseHandler): void {
    clearTimeout(handler.timeoutHandle);
    if (handler.messageId == null) {
      return;
    }
    this.waitForResponse.delete(handler.messageId);
  }

  private handleMessageResult(autoMessage: IAutoMessage<IAutoMessageAsyncMessageResult>): void {

    if (autoMessage.id == null) {
      Logger.instance.error(`Got ${AutoMessageType.AsyncMessageResult} with empty id.`);
      return;
    }

    if (autoMessage.clientId == null) {
      Logger.instance.error(`Got ${AutoMessageType.AsyncMessageResult} with empty clientId.`);
      return;
    }
    const messageId = autoMessage.data!.originalMessageId;
    const clientId = autoMessage.clientId;
    const isOk = autoMessage.data!.ok === true;
    const result = autoMessage.data!.result;
    const error = autoMessage.data!.error;

    if (!this.waitForResponse.has(messageId)) {
      Logger.instance.error(
        `Got unexpected result message: ${messageId} from the client ${clientId} with the result: `, autoMessage.data
      );
      return;
    }

    const responseMessage = this.waitForResponse.get(messageId)!;

    if (isOk) {
      responseMessage.resolve(result);
    } else {
      responseMessage.reject(error);
    }
  }

  private initSubscriptions(): void {
    this.messageSubscription = this.transporter.message$.pipe(
      switchMap((message: IAutoMessage<IAutoMessageData>) => from(this.processMessage(message)))
    ).subscribe();
  }
}
