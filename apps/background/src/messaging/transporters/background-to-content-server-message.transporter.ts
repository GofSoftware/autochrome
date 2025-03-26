import {
	AutoMessageType,
	IAutoMessage, IAutoMessageContentData, IAutoMessageData
} from '@autochrome/core/messaging/i-auto-message';
import { BaseServerMessageTransporter } from '@autochrome/core/messaging/base-server-message.transporter';
import { BackgroundToContentClientMessageTransporter } from './background-to-content-client-message.transporter';

export class BackgroundToContentServerMessageTransporter<T extends IAutoMessageContentData = IAutoMessageContentData>
		extends BaseServerMessageTransporter<T> {

	public static create<U extends IAutoMessageContentData = IAutoMessageContentData>(): BackgroundToContentServerMessageTransporter<U> {
		return new BackgroundToContentServerMessageTransporter<U>();
	}

	private messageListener = (message: IAutoMessage<T>, sender: chrome.runtime.MessageSender) => {
		return this.processMessage(message, sender);
	}

	private tabIdToClientIdMap = new Map<string, string>();

	constructor() {
		super();
		chrome.runtime.onMessage.addListener(this.messageListener);
	}

	public async dispose(): Promise<void> {
		super.dispose();
		chrome.runtime.onMessage.removeListener(this.messageListener);
		this.tabIdToClientIdMap.clear();
	}

	public async sendMessage(message: IAutoMessage<T>, toTabOrClientId: string): Promise<void> {
		await super.sendMessage(message, this.getClientIdFromTabId(toTabOrClientId));
	}

	public buildMessage<Y extends IAutoMessageData>(data: Y, noResponse: boolean, toTabOrClientId: string): IAutoMessage<IAutoMessageData> {
		return super.buildMessage(data, noResponse, this.getClientIdFromTabId(toTabOrClientId));
	}

	private processMessage(message: IAutoMessage<T>, sender: chrome.runtime.MessageSender): void {
		const tabId = sender?.tab?.id?.toString();
		if (tabId == null) {
			return;
		}
		if (!this.clientTransporters.has(message.clientId)) {
			if (message.data.type !== AutoMessageType.AsyncMessageClientConnect) {
				return;
			}
            this.closeExistingTransporterForTab(sender?.tab?.id);
			const transporter = BackgroundToContentClientMessageTransporter.create<T>(sender?.tab?.id!);
			this.tabIdToClientIdMap.set(tabId, message.clientId);
			this.registerClientTransporter(transporter);
			transporter.acceptMessage(message);
			return;
		}
		(this.clientTransporters.get(message.clientId)!.transporter as BackgroundToContentClientMessageTransporter<T>).acceptMessage(message);
	}

    private closeExistingTransporterForTab(tabId: number | undefined): void {
        if (tabId == null || !this.tabIdToClientIdMap.has(tabId.toString())) {
            return;
        }
        const clientId = this.tabIdToClientIdMap.get(tabId.toString());
        this.closeConnection(clientId);
    }

	private getClientIdFromTabId(toTabOrClientId: string): string {
		return this.tabIdToClientIdMap.has(toTabOrClientId) ? this.tabIdToClientIdMap.get(toTabOrClientId)! : toTabOrClientId;
	}
}
