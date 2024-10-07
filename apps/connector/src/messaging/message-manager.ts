import {
    AutoMessageType,
    IAutoMessage, IAutoMessageDataType,
    IAutoMessageWebSocketConnect,
    IAutoMessageWebSocketLog, IAutoMessageWebSocketResult, ProgramContainerAction
} from '@autochrome/core/auto-link/messaging/i-auto-message';
import {WebSocketConnectMessageProcessor} from "./processors/web-socket-connect-message.processor";
import { WebSocketLogMessageProcessor } from './processors/web-socket-Log-message.processor';
import { ProgramContainer } from '@autochrome/core/program/container/program-container';
import { ProgramHolder } from '../config/program-holder';
import WebSocket from 'ws';
import { Guid } from '@autochrome/core/common/guid';
import { Logger } from '@autochrome/core/common/logger';

const WATCH_DOG_TIMEOUT = 60000;

interface IWaitResponseHandler {
    messageId: string;
    resolve: (value: any) => void;
    reject: (reason: any) => void;
}

export class MessageManager {
    private static messageProcessorInstance: MessageManager;
    public static get instance(): MessageManager {
        return MessageManager.messageProcessorInstance || (MessageManager.messageProcessorInstance = new MessageManager());
    }

    private webSocket: WebSocket.WebSocket;
    private waitForResponse = new Map<string, Map<string, IWaitResponseHandler>>;

    public init(webSocket: WebSocket.WebSocket): void {
        this.webSocket = webSocket;
        this.webSocket.on('message', async (message: string) => {
            try {
                await this.processMessage(message);
            } catch (error) {
                console.error(`ws.on('message') Error: `, error);
            }
        });
    }

    public async processMessage(message: string): Promise<void> {
        const autoMessage = this.parse(message);
        switch (autoMessage.type) {
            case AutoMessageType.WebSocketConnect:
                await WebSocketConnectMessageProcessor.create().process(autoMessage.data as IAutoMessageWebSocketConnect);
                await this.sendProgram((autoMessage.data as IAutoMessageWebSocketConnect).clientId);
                break;
            case AutoMessageType.WebSocketLog:
                await WebSocketLogMessageProcessor.create().process(autoMessage.data as IAutoMessageWebSocketLog);
                break;
            case AutoMessageType.WebSocketMessageResult:
                this.handleMessageResult(autoMessage as IAutoMessage<IAutoMessageWebSocketResult>);
                break;
            default:
                console.error(`MessageManager.processMessage Error: Unknown autoMessage type ${autoMessage.type}`);
        }
    }

    private async sendMessage<T extends IAutoMessageDataType, U = void>(clientId: string, message: IAutoMessage<T>): Promise<U> {
        return new Promise<U>((resolve, reject) => {
            message.id = Guid.v4();
            const handler: IWaitResponseHandler = {
                messageId: message.id,
                resolve: (value: U) => {
                    this.unRegisterWaiter(clientId, handler);
                    resolve(value)
                },
                reject: (reason: any) => {
                    this.unRegisterWaiter(clientId, handler);
                    reject(reason);
                }
            };
            try {
                this.registerWaiter(clientId, handler);
                this.webSocket.send(JSON.stringify(message));
                setTimeout(() => {
                    handler.reject(`Message ${handler.messageId} response wait for client: ${clientId} timed out`);
                }, WATCH_DOG_TIMEOUT)
            } catch (error) {
                handler.reject(error);
            }
        });
    }

    private parse(message: string): IAutoMessage {
        try {
            const autoMessage = JSON.parse(message);
            if (typeof autoMessage.type !== "string" || typeof autoMessage.data === "undefined") {
                throw new Error('The message is not an IAutoMessage');
            }
            return autoMessage
        } catch (error) {
            console.error(error);
        }
        return null;
    }

    private async sendProgram(clientId: string): Promise<void> {
        const program = ProgramHolder.instance.popProgram();
        if (program == null) {
            return;
        }
        await this.sendMessage(clientId, {type: AutoMessageType.ContainerClearAll, data: null});

        const container = ProgramContainer.create(program, null);
        await this.sendMessage(clientId, {type: AutoMessageType.ContainerNew, data: {container}});
        await this.sendMessage(clientId, {
            type: AutoMessageType.ContainerAction,
            data: {containerId: container.id, action:ProgramContainerAction.Play}
        });
    }

    private registerWaiter(clientId: string, handler: IWaitResponseHandler): void {
        if (!this.waitForResponse.has(clientId)) {
            this.waitForResponse.set(clientId, new Map());
        }

        this.waitForResponse.get(clientId).set(handler.messageId, handler);
    }

    private unRegisterWaiter(clientId: string, handler: IWaitResponseHandler): void {
        if (!this.waitForResponse.has(clientId)) {
            return;
        }

        this.waitForResponse.get(clientId).delete(handler.messageId);
    }

    private handleMessageResult(autoMessage: IAutoMessage<IAutoMessageWebSocketResult>): void {
        if (autoMessage.id == null) {
            Logger.instance.error(`Got ${AutoMessageType.WebSocketMessageResult} with empty id.`);
            return;
        }

        if (autoMessage.data.clientId == null) {
            Logger.instance.error(`Got ${AutoMessageType.WebSocketMessageResult} with empty clientId.`);
            return;
        }
        const messageId = autoMessage.id;
        const clientId = autoMessage.data.clientId;
        const isOk = autoMessage.data.ok === true;
        const result = autoMessage.data.result;
        const error = autoMessage.data.error;

        if(!this.waitForResponse.has(clientId)) {
            Logger.instance.error(`Got not expected ${AutoMessageType.WebSocketMessageResult} from the unknown client ${clientId}.`);
            return;
        }

        if(!this.waitForResponse.get(clientId).has(messageId)) {
            Logger.instance.error(
                `Got not expected ${AutoMessageType.WebSocketMessageResult} from the client ${clientId} for message: ${messageId}.`
            );
            return;
        }

        if (isOk) {
            this.waitForResponse.get(clientId).get(messageId).resolve(result);
        } else {
            this.waitForResponse.get(clientId).get(messageId).reject(error);
        }
    }
}
