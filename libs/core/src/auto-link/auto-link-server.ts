import {
	IAutoMessage,
	IAutoMessageDataContainerChanged,
	IAutoMessageContainerChangeType,
	IAutoMessageDataContentProgramAction,
	AutoMessageType, IAutoMessageDataContentProgramInterrupt
} from './messaging/i-auto-message';
import { IAutoAction } from '../program/actions/auto-action';

export class AutoLinkServer {
	private static autoLinkServerInstance: AutoLinkServer;
	public static get instance(): AutoLinkServer {
		return AutoLinkServer.autoLinkServerInstance || (AutoLinkServer.autoLinkServerInstance = new AutoLinkServer());
	}

	public async sendContainerUpdate(containerId: string, type: IAutoMessageContainerChangeType): Promise<boolean> {
		const message: IAutoMessage<IAutoMessageDataContainerChanged> = {type: AutoMessageType.ContainerUpdate, data: {containerId, type}};
		const contexts = await (chrome.runtime as any).getContexts({contextTypes: ['POPUP']});
		if (!Array.isArray(contexts) || contexts.length === 0) {
			return  true; // assume the popup isn't opened.
		}
		const result = await chrome.runtime.sendMessage(message);
		return result === true;
	}

	public async sendNextAction(tabId: number, action: IAutoAction): Promise<boolean> {
		const message: IAutoMessage<IAutoMessageDataContentProgramAction> = {type: AutoMessageType.ContentProgramAction, data: {action}};
		const result = await chrome.tabs.sendMessage(tabId, message);
		return result === true;
	}

	public async sendInterrupt(tabId: number, reason: string): Promise<boolean> {
		const message: IAutoMessage<IAutoMessageDataContentProgramInterrupt> = {
			type: AutoMessageType.ContentProgramInterrupt, data: {reason}
		};
		const result = await chrome.tabs.sendMessage(tabId, message);
		return result === true;
	}
}
