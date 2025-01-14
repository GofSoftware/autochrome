import { Observable } from 'rxjs';
import { IAutoMessage, IAutoMessageData } from '@autochrome/core/messaging/i-auto-message';
import { IConnectorConnection } from '@autochrome/core/messaging/connnection/i-connector-connection';

export interface IMessageTransporter<T extends IAutoMessageData> {
	message$: Observable<IAutoMessage<T>>;
	connected$: Observable<boolean | null>;
	dispose(): void;
}

export interface IClientMessageTransporter<T extends IAutoMessageData> extends IMessageTransporter<T> {
	clientId: string;
	connection: IConnectorConnection | null;
	sendMessage(message: IAutoMessage<IAutoMessageData>): Promise<void>;
	buildMessage<Y extends IAutoMessageData>(data: Y, noResponse: boolean): IAutoMessage<IAutoMessageData>;
	connect(): void;
	closeConnection(): void;
}

export interface IServerMessageTransporter<T extends IAutoMessageData> extends IMessageTransporter<T> {
	sendMessage(message: IAutoMessage<IAutoMessageData>, clientId: string | null): Promise<void>;
	buildMessage<Y extends IAutoMessageData>(data: Y, noResponse: boolean, toClientId: string | null): IAutoMessage<IAutoMessageData>;
	closeConnections(): void;
}
