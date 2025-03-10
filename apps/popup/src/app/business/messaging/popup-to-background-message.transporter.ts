import {
	IAutoMessage, IAutoMessageData,
	IAutoMessageViewData
} from '@autochrome/core/messaging/i-auto-message';
import { BaseClientMessageTransporter } from '@autochrome/core/messaging/base-client-message.transporter';
import { Guid } from '@autochrome/core/common/guid';
import { AutoMessageBuilder } from '@autochrome/core/messaging/auto-message.builder';

export class PopupToBackgroundMessageTransporter<T extends IAutoMessageViewData = IAutoMessageViewData> extends BaseClientMessageTransporter<T> {
	public static create<Y extends IAutoMessageViewData = IAutoMessageViewData>(): PopupToBackgroundMessageTransporter<Y> {
		return new PopupToBackgroundMessageTransporter();
	}

	public clientId = PopupToBackgroundMessageTransporter.name + '_' + Guid.v4();

	private messageListener = (message: IAutoMessage<T>, sender: chrome.runtime.MessageSender) => {
		this.processMessage(message, sender);
	};

	constructor() {
		super();
		chrome.runtime.onMessage.addListener(this.messageListener);
		this.connect();
	}

	public async dispose(): Promise<void> {
		super.dispose();
		chrome.runtime.onMessage.removeListener(this.messageListener);
	}

	public async sendMessage(message: IAutoMessage<T>): Promise<void> {
		await chrome.runtime.sendMessage(message);
	}

	public buildMessage<Y extends IAutoMessageData>(data: Y, noResponse: boolean): IAutoMessage<IAutoMessageData> {
		return AutoMessageBuilder.create(data, noResponse, this.clientId);
	}

	private processMessage(message: IAutoMessage<T>, sender: chrome.runtime.MessageSender) {
		if (sender?.tab?.id != null) {
			return;
		}
		this.$message.next(message);
	}
}
