import {
	IAutoMessage, IAutoMessageData, IAutoMessageViewData,
} from '@autochrome/core/messaging/i-auto-message';
import WebSocket from 'ws';
import { BaseClientMessageTransporter } from '@autochrome/core/messaging/base-client-message.transporter';
import { Guid } from '@autochrome/core/common/guid';
import { AutoMessageBuilder } from '@autochrome/core/messaging/auto-message.builder';
import { Logger } from '@autochrome/core/common/logger';

export class ConnectorWebSocketClientMessageTransporter<T extends IAutoMessageViewData = IAutoMessageViewData>
		extends BaseClientMessageTransporter<T> {

	public static create<Y extends IAutoMessageViewData = IAutoMessageViewData>(webSocket: WebSocket.WebSocket, pingEnabled: boolean = true):
		ConnectorWebSocketClientMessageTransporter<Y> {
			return new ConnectorWebSocketClientMessageTransporter(webSocket, pingEnabled);
	}

	public clientId = ConnectorWebSocketClientMessageTransporter.name + '_' + Guid.v4();

	private onMessage = async (message: string) => { await this.processMessage(message); };
	private checkStateIntervalHandle = setInterval(() => { try { this.checkState(); } catch(error) { Logger.instance.error(error)} }, 1000);

	public constructor(private webSocket: WebSocket.WebSocket | null, pingEnabled: boolean = true) {
		super();
		this.pingEnabled = pingEnabled;
		if (this.webSocket != null) {
			this.webSocket.on('message', this.onMessage);
			this.webSocket.on('error', (error) => {
				Logger.instance.error(`WebSocket error: ${error?.message}`, error);
				this.dispose();
			});
		}
	}

	public async sendMessage(message: IAutoMessage<T>): Promise<void> {
		if (this.webSocket == null) {
			throw new Error(`${ConnectorWebSocketClientMessageTransporter.name} is not initialized or has been disposed.`);
		}
		this.checkState();
		this.webSocket.send(JSON.stringify(message));
	}

	public buildMessage<Y extends IAutoMessageData>(data: Y, noResponse: boolean): IAutoMessage<IAutoMessageData> {
		return AutoMessageBuilder.create(data, noResponse, this.clientId);
	}

	public async dispose(): Promise<void> {
		if (this.checkStateIntervalHandle != null) {
			clearInterval(this.checkStateIntervalHandle);
		}
		this.webSocket?.off('message', this.onMessage);
		this.webSocket = null;
		super.dispose();
	}

	private checkState(): void {
		if (this.webSocket == null) {
			return;
		}
		const readyState = this.webSocket.readyState;
		if (readyState === WebSocket.CLOSING || readyState === WebSocket.CLOSED) {
			this.dispose();
			throw new Error(`WebSocket state: ${readyState}, disposing....`);
		}
	}

	private async processMessage(message: string): Promise<void> {
		try {
			const decodedMessage = this.decodeMessage(message);
			this.$message.next(decodedMessage);
		} catch (error) {
			console.error(`ws.on('message') Error: `, error);
		}
	}
}
