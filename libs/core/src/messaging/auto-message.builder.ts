import { IAutoMessage, IAutoMessageData } from '@autochrome/core/messaging/i-auto-message';
import { Guid } from '@autochrome/core/common/guid';

export class AutoMessageBuilder {
	public static create<Y extends IAutoMessageData>(data: Y, noResponse: boolean, clientId: string): IAutoMessage<IAutoMessageData> {
		return  {id: Guid.v4(), clientId, noResponse, data};
	}
}
