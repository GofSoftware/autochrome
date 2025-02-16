import { BehaviorSubject, filter, Observable, Subject } from 'rxjs';
import { AutoMessageType, IAutoMessage, IAutoMessageAsyncMessageResult, IAutoMessageData } from '@autochrome/core/messaging/i-auto-message';
import { IClientMessageTransporter } from '@autochrome/core/messaging/i-client-message-transporter';
import { Logger } from '@autochrome/core/common/logger';
import { IConnectorConnection } from '@autochrome/core/messaging/connnection/i-connector-connection';
import { AutoMessageBuilder } from '@autochrome/core/messaging/auto-message.builder';
import { ConnectorConnection } from '@autochrome/core/messaging/connnection/connector-connection';

export abstract class BaseClientMessageTransporter<T extends IAutoMessageData> implements IClientMessageTransporter<T> {
	protected $message = new Subject<IAutoMessage<T>>();
	protected $connected = new BehaviorSubject<boolean | null>(null);

	public message$: Observable<IAutoMessage<T>> = this.$message.pipe(filter((message) => this.preProcessMessage(message)));
	public connected$: Observable<boolean | null> = this.$connected.asObservable();
	public abstract clientId: string;

	public connection: IConnectorConnection | null = null;
	private connectMessageId: string | null = null;

	public abstract sendMessage(message: IAutoMessage<T>): Promise<void>;
	public abstract buildMessage<Y extends IAutoMessageData>(data: Y, noResponse: boolean): IAutoMessage<IAutoMessageData>;

	public connect(): void {
		const message = AutoMessageBuilder.create({type: AutoMessageType.AsyncMessageClientConnect}, false, this.clientId);
		this.connectMessageId = message.id;
		this.sendMessage(message as any).then(/*Do not wait*/);
	}

	public dispose(): void {
		this.closeConnection();
	}

	public closeConnection(): void {
		if (this.connection == null) {
			return;
		}
		this.connection.close();
        Logger.instance.log(`BaseClientMessageTransporter: The client with id ${this.connection.clientId} has been closed.`);
		this.connection = null;
		this.$connected.next(false);
	}

	protected decodeMessage(message: string): IAutoMessage<T> {
		return JSON.parse(message);
	}

	protected encodeMessage(message: IAutoMessage<T>): string {
		return JSON.stringify(message)
	}

	private preProcessMessage(message: IAutoMessage<IAutoMessageData>): boolean {
		if (message.data.type === AutoMessageType.AsyncMessageResult) {
			const resultMessage = message as IAutoMessage<IAutoMessageAsyncMessageResult>;
			if (resultMessage.data.originalMessageId === this.connectMessageId && resultMessage.data.ok) {
				this.acceptConnection(resultMessage);
				return false;
			}
		}

		if (message.data.type === AutoMessageType.AsyncMessageClientConnect) {
			this.acceptConnection(message);
			const responseMessage = AutoMessageBuilder.create<IAutoMessageAsyncMessageResult>(
				{
					type: AutoMessageType.AsyncMessageResult,
					ok: true,
					originalMessageId: message.id,
				},
				false,
				this.clientId
			);
			this.sendMessage(responseMessage as any).then(/*Do not wait*/);
			return false;
		}

		if (this.connection == null || this.connection.clientId !== message.clientId) {
			return false;
		}

		this.logMessage(message);

		return true;
	}

	private logMessage(message: IAutoMessage<IAutoMessageData>, ...params: any[]): void {
		const responseForId = (message.data.type === AutoMessageType.AsyncMessageResult)
			? ' response for: ' + (message.data! as IAutoMessageAsyncMessageResult).originalMessageId
			: '';
		Logger.instance.debug(`${this.clientId} got message type: ${message.data.type} id: ${message.id}${responseForId}`, message, ...params);
	}

	private acceptConnection(message: IAutoMessage<IAutoMessageData>): void {
		const remoteClientId = message.clientId;

		if (this.connection != null) {
			this.connection.close();
		}

		this.connection = ConnectorConnection.create(remoteClientId);

		this.$connected.next(true);

        Logger.instance.log(`BaseClientMessageTransporter: A new client with id ${remoteClientId} has been accepted.`);
	}
}
