import {
    ProgramContainerAction,
    AutoMessageType, AutoMessageViewDataType, IBrowserTab
} from '@autochrome/core/messaging/i-auto-message';
import { IProgramContainerInfo } from '@autochrome/core/program/container/i-program-container';
import { IRobotSettingsGlobal } from '@autochrome/core/settings/i-robot-settings-global';
import { MessageManager } from '@autochrome/core/messaging/message-manager';

export class PopupToBackgroundLinkFacade {
	private static backgroundLinkFacadeInstance: PopupToBackgroundLinkFacade;
	public static get instance(): PopupToBackgroundLinkFacade {
		return PopupToBackgroundLinkFacade.backgroundLinkFacadeInstance ||
			(PopupToBackgroundLinkFacade.backgroundLinkFacadeInstance = new PopupToBackgroundLinkFacade());
	}

	private messageManager: MessageManager<AutoMessageViewDataType> | undefined;

	public init(messageSender: MessageManager<AutoMessageViewDataType>): void {
		this.messageManager = messageSender;
	}

	public async newContainer(container: string, tabId: number): Promise<void> {
		await this.messageManager?.sendMessage({type: AutoMessageType.ContainerNew, container, tabId}, null);
	}

	public async removeContainer(containerId: string): Promise<void> {
		await this.messageManager?.sendMessage({type: AutoMessageType.ContainerRemove, containerId}, null);
	}

	public async updateContainers(containerInfos: IProgramContainerInfo[]): Promise<void> {
		await this.messageManager?.sendMessage({type: AutoMessageType.SeveralContainersUpdate, containerInfos}, null);
	}

	public async getProgramList(): Promise<IProgramContainerInfo[]> {
		return (await this.messageManager?.sendMessage<IProgramContainerInfo[]>({type: AutoMessageType.GetProgramList}, null))!;
	}

	public async getBrowserTabs(): Promise<IBrowserTab[]> {
		return (await this.messageManager?.sendMessage<IBrowserTab[]>({type: AutoMessageType.GetBrowserTabList}, null))!;
	}

	public async doContainerAction(containerId: string, action: ProgramContainerAction): Promise<void> {
		await this.messageManager?.sendMessage({type: AutoMessageType.ContainerAction, containerId, action}, null);
	}

	public async setGlobalSettings(globalSettings: Partial<IRobotSettingsGlobal>): Promise<void> {
		await this.messageManager?.sendMessage({type: AutoMessageType.SetGlobalSettings, globalSettings}, null);
	}

	public async getGlobalSettings(): Promise<IRobotSettingsGlobal> {
		return (await this.messageManager?.sendMessage<IRobotSettingsGlobal>({type: AutoMessageType.GetGlobalSettings}, null))!;
	}
}
