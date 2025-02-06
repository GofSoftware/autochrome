import { IAutoMessageData } from '@autochrome/core/messaging/i-auto-message';
import { IMessageSenderWithNoResponse } from '@autochrome/core/messaging/i-message-sender';

export class BaseLinkFacade {
	private linkMessageSenders = new Map<string, IMessageSenderWithNoResponse<IAutoMessageData>>();

	public addMessageSender(name: string, sender: IMessageSenderWithNoResponse<IAutoMessageData>): void {
		this.linkMessageSenders.set(name, sender);
	}

	public removeMessageSender(name: string): void {
		this.linkMessageSenders.delete(name);
	}

	protected async sendToAll<R = void>(data: IAutoMessageData, noResponseRequired: boolean, clientId: string | null): Promise<(R | void)[]> {
		const senders = Array.from(this.linkMessageSenders.values());
		if (senders.length === 0) {
			return [];
		}
		const promises: Promise<(R | void)>[] = senders.map(
			async (sender: IMessageSenderWithNoResponse<IAutoMessageData>) => {
				if (noResponseRequired) {
					return await sender.sendNoResponseMessage(data, clientId);
				} else {
					return await sender.sendMessage(data, clientId);
				}
			}
		);
		return await Promise.all(promises);
	}
}
