import {
	IAutoMessage, IAutoMessageData,
	IAutoMessageViewData
} from '@autochrome/core/messaging/i-auto-message';
import { Logger } from '@autochrome/core/common/logger';
import { IConnectorSettings } from '@autochrome/core/settings/i-connector-settings';
import { BaseClientMessageTransporter } from '@autochrome/core/messaging/base-client-message.transporter';
import { Guid } from '@autochrome/core/common/guid';
import { AutoMessageBuilder } from '@autochrome/core/messaging/auto-message.builder';

export class BackgroundToConnectorMessageTransporter<T extends IAutoMessageViewData = IAutoMessageViewData> extends BaseClientMessageTransporter<T> {
	public static create<U extends IAutoMessageViewData = IAutoMessageViewData>(settings: IConnectorSettings): BackgroundToConnectorMessageTransporter<U> {
		return new BackgroundToConnectorMessageTransporter<U>(settings);
	}

	public clientId = BackgroundToConnectorMessageTransporter.name + '_' + Guid.v4();

	private socket: WebSocket | null = null;
	private intervalHandle: number | null;

	constructor(private settings: IConnectorSettings) {
		super();
		this.refreshConnection(settings.connectorHost, settings.connectorPort);
		this.intervalHandle = setInterval(() => {
			this.refreshConnection(settings.connectorHost, settings.connectorPort);
		}, 5000) as unknown as number;
	}

	public async sendMessage(message: IAutoMessage<T>): Promise<void> {
		if (this.socket != null && (this.socket.readyState === WebSocket.OPEN)) {
			this.socket.send(this.encodeMessage(message));
			return;
		}
		throw new Error(`Socket is not open.`);
	}

	public async dispose(): Promise<void> {
		super.dispose();
		if (this.intervalHandle != null) {
			clearInterval(this.intervalHandle);
			this.intervalHandle = null;
		}
		this.closeSocket();
	}

	public buildMessage<Y extends IAutoMessageData>(data: Y, noResponse: boolean): IAutoMessage<IAutoMessageData> {
		return AutoMessageBuilder.create(data, noResponse, this.clientId);
	}

	private closeSocket(): void {
		this.closeConnection();
		if (this.socket == null) {
			return;
		}
		this.socket.close();
		this.socket = null;
		this.log('The WebSocket has been closed.');
	}

	private refreshConnection(host: string, port: number): void {
		if (this.socket != null) {
			if (this.socket.readyState === WebSocket.CONNECTING || this.socket.readyState === WebSocket.OPEN) {
				// this.log('Web Socket is already created, ready state: ', this.readyStateName());
				return;
			}
			else {
				this.log('Web Socket is already created, but the ready state is ', this.readyStateName());
				this.closeSocket();
			}
		}
		this.socket = new WebSocket(`ws://${host}:${port}`);

		this.socket.addEventListener('error', (error: Event) => {
			Logger.instance.error(`WebSocket Error: `, error);
			this.closeSocket();
		});

		this.socket.addEventListener('open', () => {
			this.log('Connection is opened, sending IAutoMessageWebSocketConnect message to the server.');
			this.connect();
		});

		this.socket.addEventListener('message', async (event) => {
			try {
				this.$message.next(this.decodeMessage(event.data));
			} catch (error) {
				Logger.instance.error('WebSocket message Error:', error);
			}
		});
	}

	private readyStateName(): string {
		switch (this.socket?.readyState) {
			case WebSocket.OPEN:
				return 'OPEN';
			case WebSocket.CONNECTING:
				return 'CONNECTING';
			case WebSocket.CLOSING:
				return 'CLOSING';
			case WebSocket.CLOSED:
				return 'CLOSED';
			default:
				return `UNKNOWN ${this.socket?.readyState}`;
		}
	}

	private log(message: string, ...params: any[]): void {
		if (!this.settings.enableConnectorLogging) {
			return;
		}
		Logger.instance.log(message, ...params);
	}
}
