import { BaseClientMessageTransporter } from '@autochrome/core/messaging/base-client-message.transporter';
import {
	IAutoMessage, IAutoMessageData,
	IAutoMessageViewData
} from '@autochrome/core/messaging/i-auto-message';
import { Guid } from '@autochrome/core/common/guid';
import { AutoMessageBuilder } from '@autochrome/core/messaging/auto-message.builder';
import { Logger } from '@autochrome/core/common/logger';

export class BackgroundToPopupMessageTransporter<T extends IAutoMessageViewData = IAutoMessageViewData> extends BaseClientMessageTransporter<T> {
	public static create<U extends IAutoMessageViewData = IAutoMessageViewData>(): BackgroundToPopupMessageTransporter<U> {
		return new BackgroundToPopupMessageTransporter<U>();
	}

	public clientId = BackgroundToPopupMessageTransporter.name + '_' + Guid.v4();

	private messageListener = (message: IAutoMessage<T>, sender: chrome.runtime.MessageSender) => {
		return this.processMessage(message, sender);
	}

	constructor() {
		super();
		chrome.runtime.onMessage.addListener(this.messageListener);
	}

	public async dispose(): Promise<void> {
		super.dispose();
		chrome.runtime.onMessage.removeListener(this.messageListener);
	}

	public async sendMessage(message: IAutoMessage<T>): Promise<void> {
		await (chrome.runtime.sendMessage(message).catch((error) => { this.closeConnection(); Logger.instance.error(error);}));
	}

	public buildMessage<Y extends IAutoMessageData>(data: Y, noResponse: boolean): IAutoMessage<IAutoMessageData> {
		return AutoMessageBuilder.create(data, noResponse, this.clientId);
	}

	private processMessage(message: IAutoMessage<T>, sender: chrome.runtime.MessageSender): void {
		if (sender?.tab?.id != null) {
			return;
		}
		this.$message.next(message);
	}
}
