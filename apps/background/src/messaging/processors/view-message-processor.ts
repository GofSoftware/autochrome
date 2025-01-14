import {
	IAutoMessage,
	IAutoMessageViewDataNewContainer,
	IAutoMessageViewDataRemoveContainer,
	AutoMessageType,
	IAutoMessageViewDataSetGlobalSettings,
	IAutoMessageViewDataContainerAction,
	IAutoMessageViewDataSeveralContainersUpdate, AutoMessageViewDataType, IBrowserTab, IAutoMessageViewDataCloseBrowserTab
} from '@autochrome/core/messaging/i-auto-message';
import { Logger } from '@autochrome/core/common/logger';
import { Robot } from '../../robot/robot';
import { ProgramContainer } from '@autochrome/core/program/container/program-container';
import { ExtractedProgramContainerManager } from '../../container/extracted-program-container-manager';
import { ViewInterfaceLinkFacade } from '../../view-interface-link-facade';
import { RobotSettingsGlobalManager } from '@autochrome/core/settings/robot-settings-global-manager';
import { BackgroundMessagingContext } from '../background-messaging.context';

export class ViewMessageProcessor<T extends AutoMessageViewDataType> {
	public static create<U extends AutoMessageViewDataType>(context: BackgroundMessagingContext): ViewMessageProcessor<U> {
		return new ViewMessageProcessor(context);
	}

	protected constructor(private context: BackgroundMessagingContext) {
	}

	public async processMessage(message: IAutoMessage<T>): Promise<any> {
		switch (message.data.type) {
			case AutoMessageType.ContainerClearAll:
			case AutoMessageType.ContainerNew:
			case AutoMessageType.ContainerRemove:
			case AutoMessageType.SeveralContainersUpdate:
				return await this.processContainerMessage(message);
			case AutoMessageType.SetGlobalSettings:
			case AutoMessageType.ContainerAction:
				return await this.processRobotMessage(message);
			case AutoMessageType.GetGlobalSettings:
				return await RobotSettingsGlobalManager.instance.getSettings();
			case AutoMessageType.GetProgramList:
				return (await ExtractedProgramContainerManager.instance.getAllContainers())
						.map((container) => container.programContainer.toInfo());
			case AutoMessageType.GetBrowserTabList:
				return await this.getBrowserTabs();
			case AutoMessageType.CloseBrowserTab:
				return await this.closeBrowserTab(message);
			default:
				return false;
		}
	}

	private async processContainerMessage(message: IAutoMessage<T>): Promise<boolean> {
		switch (message?.data.type) {
            case AutoMessageType.ContainerClearAll:
                try {
                    await ExtractedProgramContainerManager.instance.clearAll();
                    await this.sendProgramListUpdate();
                } catch (error) {
                    Logger.instance.error('ContainerClearAll error:', error);
                }
                return true;
			case AutoMessageType.ContainerNew:
				try {
					const data = message.data! as IAutoMessageViewDataNewContainer;
					const programContainer = ProgramContainer.create(data.container, data.tabId);
					await ExtractedProgramContainerManager.instance.addContainer(programContainer);
					await this.sendProgramListUpdate();
				} catch (error) {
					Logger.instance.error('ContainerNew error:', error);
				}
				return true;
			case AutoMessageType.ContainerRemove:
				const removeContainerId = (message as IAutoMessage<IAutoMessageViewDataRemoveContainer>).data!.containerId;
				await ExtractedProgramContainerManager.instance.removeContainer(removeContainerId);
				await this.sendProgramListUpdate();
				return true;
			case AutoMessageType.SeveralContainersUpdate:
				const containers = (message as IAutoMessage<IAutoMessageViewDataSeveralContainersUpdate>).data!.containerInfos;

				for (const container of containers) {
					if (container.id == null) {
						continue;
					}
					const containerToUpdate = await ExtractedProgramContainerManager.instance.getContainer(container.id);
					if (containerToUpdate != null) {
						Object.assign(containerToUpdate.programContainer, container);
						await ExtractedProgramContainerManager.instance.setContainer(containerToUpdate);
					}
				}

				await this.sendProgramListUpdate();
				return true;
			default:
				Logger.instance.warn(`processContainerMessage: Unknown message type: ${message?.data.type}`);
                return false;
		}
	}

	private async processRobotMessage(message: IAutoMessage<T>): Promise<boolean> {
		try {
			switch (message.data.type) {
				case AutoMessageType.SetGlobalSettings:
					const settings = (message.data! as IAutoMessageViewDataSetGlobalSettings).globalSettings;
					await RobotSettingsGlobalManager.instance.setSettings(settings);
					this.context.notifySettingsChanged(settings);
					await this.sendRobotSettings();
					break;
				case AutoMessageType.ContainerAction:
					const data = (message.data! as IAutoMessageViewDataContainerAction);
					await Robot.instance.processContainerAction(data.containerId, data.action);
					break;
			}
			return true;
		} catch (error) {
			Logger.instance.error('processRobotMessage Error.', error);
            return false;
		}
	}

	private async sendProgramListUpdate(): Promise<void> {
		const containers =
			(await ExtractedProgramContainerManager.instance.getAllContainers()).map((container) => container.programContainer.toInfo())
		await ViewInterfaceLinkFacade.instance.sendProgramListUpdate(containers);
	}

	private async sendRobotSettings(): Promise<void> {
		const settings = await RobotSettingsGlobalManager.instance.getSettings();
		await ViewInterfaceLinkFacade.instance.sendRobotSettings(settings);
	}

	private async getBrowserTabs(): Promise<IBrowserTab[]> {
		const tabs = await chrome.tabs.query({});
		return tabs.map((tab) => {
			return { id: tab.id!, title: tab.title!, url: tab.url! };
		});
	}

	private async closeBrowserTab(message: IAutoMessage<T>): Promise<void> {
		const closeTabMessage = message as IAutoMessage<IAutoMessageViewDataCloseBrowserTab>;
		const tabs = (await chrome.tabs.query({})).filter((tab) => {
			return (closeTabMessage.data.tabId != null )
				? tab.id === closeTabMessage.data.tabId
				: (closeTabMessage.data.tabUrlOrTitle != null && (
					tab.title === closeTabMessage.data.tabUrlOrTitle || tab.url === closeTabMessage.data.tabUrlOrTitle
				));
		});

		await Promise.all(tabs.map(async (tab) => chrome.tabs.remove(tab.id!)));
	}
}
