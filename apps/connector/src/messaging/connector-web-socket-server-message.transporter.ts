import { IAutoMessageViewData, } from '@autochrome/core/messaging/i-auto-message';
import { BaseServerMessageTransporter } from '@autochrome/core/messaging/base-server-message.transporter';
import expressWs from 'express-ws';
import express from 'express';
import { ConnectorWebSocketClientMessageTransporter } from './connector-web-socket-client-message.transporter';
import { Config } from '../config/config';
import { Logger } from '@autochrome/core/common/logger';

export class ConnectorWebSocketServerMessageTransporter<T extends IAutoMessageViewData = IAutoMessageViewData>
		extends BaseServerMessageTransporter<T> {

	public static create<Y extends IAutoMessageViewData = IAutoMessageViewData>():
		ConnectorWebSocketServerMessageTransporter<Y> {
			return new ConnectorWebSocketServerMessageTransporter();
	}

	private app: expressWs.Instance | null;

	public constructor() {
		super();
		this.app = expressWs(express());
		this.app.app.listen(Config.instance.port, Config.instance.host, () => {
			console.log(`Listening ${Config.instance.host}:${Config.instance.port}\n`);
		});
		this.app.app.ws('/', (ws) => {
			this.registerClientTransporter(ConnectorWebSocketClientMessageTransporter.create<T>(ws));
		});
	}
}
