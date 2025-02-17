import { BaseClientMessageTransporter } from '@autochrome/core/messaging/base-client-message.transporter';
import {
	IAutoMessage, IAutoMessageContentData, IAutoMessageData
} from '@autochrome/core/messaging/i-auto-message';
import { Guid } from '@autochrome/core/common/guid';
import { AutoMessageBuilder } from '@autochrome/core/messaging/auto-message.builder';
import { Logger } from '@autochrome/core/common/logger';

export class BackgroundToContentClientMessageTransporter<T extends IAutoMessageContentData = IAutoMessageContentData>
		extends BaseClientMessageTransporter<T> {
	public static create<Y extends IAutoMessageContentData = IAutoMessageContentData>(
		tabId: number
	): BackgroundToContentClientMessageTransporter<Y> {
		return new BackgroundToContentClientMessageTransporter<Y>(tabId);
	}

	public clientId = BackgroundToContentClientMessageTransporter.name + '_' + Guid.v4();

	private constructor(public tabId: number) {
		super();
	}

	public async dispose(): Promise<void> {
		super.dispose();
	}

	public async sendMessage(message: IAutoMessage<T>): Promise<void> {
		if (this.tabId == null) {
			throw new Error(`Error: ${this.clientId} tabId is not set.`);
		}
		await (chrome.tabs.sendMessage(this.tabId!, message).catch((error) => { this.closeConnection(); Logger.instance.error(error);}));
	}

	public buildMessage<Y extends IAutoMessageData>(data: Y, noResponse: boolean): IAutoMessage<IAutoMessageData> {
		return AutoMessageBuilder.create(data, noResponse, this.clientId);
	}

	public acceptMessage(message: IAutoMessage<T>): void {
		message.data.tabId = this.tabId; // Content script doesn't know its tab id, so we have to set it here to let Robot know it.
		this.$message.next(message);
	}
}
