import { IAutoMessage, IAutoMessageData } from '@autochrome/core/messaging/i-auto-message';

export interface IMessageProcessor {
	process(message: IAutoMessage<IAutoMessageData>): Promise<any>
}
