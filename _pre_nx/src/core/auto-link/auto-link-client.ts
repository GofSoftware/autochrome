import {
	ProgramContainerAction,
	IAutoMessage, IAutoMessageDataContainerAction,
	IAutoMessageDataContainerChanged,
	IAutoMessageDataNewContainer,
	IAutoMessageDataRemoveContainer,
	AutoMessageType, IAutoMessageDataUpdateContainer, IAutoMessageDataSetGlobalSettings
} from './messaging/i-auto-message';
import { BehaviorSubject, Observable } from 'rxjs';
import { IProgramContainer } from '../program/container/program-container';
import { Logger } from '../common/logger';
import { IRobotSettingsGlobal } from '../settings/robot-settings-global';

export class AutoLinkClient {
	private static autoLinkClientInstance: AutoLinkClient;
	public static instance(): AutoLinkClient {
		return AutoLinkClient.autoLinkClientInstance || (AutoLinkClient.autoLinkClientInstance = new AutoLinkClient());
	}

	private constructor() {
	}

	private containerChangesSubject$ = new BehaviorSubject<IAutoMessageDataContainerChanged>(null);

	public get containerChanges$(): Observable<IAutoMessageDataContainerChanged> {
		return this.containerChangesSubject$.asObservable();
	}

	public init(): void {
		chrome.runtime.onMessage.addListener(
			(message: IAutoMessage, sender: chrome.runtime.MessageSender, sendResponse: (response: boolean) => void) => {
				Logger.instance.debug('AutoLinkClient got message', message, sender);

				switch (message?.type) {
					case AutoMessageType.ContainerUpdate:
						this.containerChangesSubject$.next(message.data as IAutoMessageDataContainerChanged);
						sendResponse(true);
						break;
					default:
						sendResponse(false);
				}

				return false;
			}
		);
	}

	public async newContainer(container: IProgramContainer): Promise<boolean> {
		const message: IAutoMessage<IAutoMessageDataNewContainer> = {type: AutoMessageType.ContainerNew, data: {container}};
		const result = await chrome.runtime.sendMessage(message);
		return result === true;
	}

	public async removeContainer(containerId: string): Promise<boolean> {
		const message: IAutoMessage<IAutoMessageDataRemoveContainer> = {type: AutoMessageType.ContainerRemove, data: {containerId}};
		const result = await chrome.runtime.sendMessage(message);
		return result === true;
	}

	public async updateContainer(container: IProgramContainer): Promise<boolean> {
		const message: IAutoMessage<IAutoMessageDataUpdateContainer> = {type: AutoMessageType.ContainerUpdate, data: {container}};
		const result = await chrome.runtime.sendMessage(message);
		return result === true;
	}

	public async doContainerAction(containerId: string, action: ProgramContainerAction): Promise<boolean> {
		const message: IAutoMessage<IAutoMessageDataContainerAction> = {type: AutoMessageType.ContainerAction, data: {containerId, action}};
		const result = await chrome.runtime.sendMessage(message);
		return result === true;
	}

	public async setGlobalSettings(globalSettings: Partial<IRobotSettingsGlobal>): Promise<boolean> {
		const message: IAutoMessage<IAutoMessageDataSetGlobalSettings> = {type: AutoMessageType.SetGlobalSettings, data: {globalSettings}};
		const result = await chrome.runtime.sendMessage(message);
		return result === true;
	}
}
