import {
	IAutoMessage,
	IAutoMessageContainerChangeType,
	IAutoMessageDataNewContainer,
	IAutoMessageDataRemoveContainer,
	IAutoMessageDataUpdateContainer,
	AutoMessageType
} from '../../core/auto-link/messaging/i-auto-message';
import { Logger } from '../../core/common/logger';
import { Robot, RobotEventDataType } from '../robot/robot';
import { ProgramContainer } from '../../core/program/container/program-container';
import { AutoLinkServer } from '../../core/auto-link/auto-link-server';
import { ExtractedProgramContainerManager } from '../../core/auto-link/extracted-program-container-manager';
import { ExtractedProgramContainer } from '../../core/program/container/extracted-program-container';

export class BackgroundMessageProcessor {
	private static contentMessageProcessorInstance: BackgroundMessageProcessor;
	public static get instance(): BackgroundMessageProcessor {
		return BackgroundMessageProcessor.contentMessageProcessorInstance ||
			(BackgroundMessageProcessor.contentMessageProcessorInstance = new BackgroundMessageProcessor());
	}

	private constructor() {
	}

	public isKnownMessage(message: IAutoMessage) {
		switch (message?.type) {
			case AutoMessageType.Ping:
			case AutoMessageType.ContainerNew:
			case AutoMessageType.ContainerRemove:
			case AutoMessageType.ContainerAction:
			case AutoMessageType.ContainerUpdate:
			case AutoMessageType.ContentAwake:
			case AutoMessageType.ContentProgramActionResult:
			case AutoMessageType.SetGlobalSettings:
				return true;
			default:
				return false;
		}
	}

	public async processMessage(
		message: IAutoMessage,
		sender: chrome.runtime.MessageSender,
		sendResponse: (response: boolean) => void
	): Promise<void> {
		Logger.instance.debug('Got IAutoMessage', message, sender, sendResponse);
		switch (message?.type) {
			case AutoMessageType.Ping:
				sendResponse(true);
				break;
			case AutoMessageType.ContainerNew:
			case AutoMessageType.ContainerRemove:
			case AutoMessageType.ContainerAction:
			case AutoMessageType.ContainerUpdate:
				const containerMessageProcessorResult = await this.processContainerMessage(message, sender);
				sendResponse(containerMessageProcessorResult);
				break;
			case AutoMessageType.ContentAwake:
			case AutoMessageType.ContentProgramActionResult:
				const contentMessageProcessorResult = await this.processContentMessage(message, sender);
				sendResponse(contentMessageProcessorResult);
				break;
			case AutoMessageType.SetGlobalSettings:
				const globalSettingsProcessorResult = await this.processGlobalSettingsMessage(message, sender);
				sendResponse(globalSettingsProcessorResult);
				break;
			default:
				sendResponse(false);
		}
	}

	private async processContainerMessage(
		message: IAutoMessage,
		sender: chrome.runtime.MessageSender
	): Promise<boolean> {
		switch (message?.type) {
			case AutoMessageType.ContainerNew:
				const programContainerJson = (message as IAutoMessage<IAutoMessageDataNewContainer>).data.container;
				try {
					const programContainer = ProgramContainer.fromJson(programContainerJson);
					await ExtractedProgramContainerManager.instance.addContainer(programContainer);
					await AutoLinkServer.instance.sendContainerUpdate(programContainer.id, IAutoMessageContainerChangeType.New);
				} catch (error) {
					Logger.instance.error('ContainerNew error:', error);
				}
				return true;
			case AutoMessageType.ContainerRemove:
				const removeContainerId = (message as IAutoMessage<IAutoMessageDataRemoveContainer>).data.containerId;
				await ExtractedProgramContainerManager.instance.removeContainer(removeContainerId);
				await AutoLinkServer.instance.sendContainerUpdate(removeContainerId, IAutoMessageContainerChangeType.Remove);
				return true;
			case AutoMessageType.ContainerUpdate:
				const updatedContainer = (message as IAutoMessage<IAutoMessageDataUpdateContainer>).data.container;
				const containerToUpdate = await ExtractedProgramContainerManager.instance.getContainer(updatedContainer.id);
				containerToUpdate.programContainer.tabId = updatedContainer.tabId;
				await ExtractedProgramContainerManager.instance.setContainer(containerToUpdate);
				await AutoLinkServer.instance.sendContainerUpdate(updatedContainer.id, IAutoMessageContainerChangeType.Update);
				return true;
			case AutoMessageType.ContainerAction:
				await Robot.instance.incomingEvent(null, message.type, message.data as RobotEventDataType);
				return true;
			default:
				Logger.instance.warn(`processContainerMessage: Unknown message type: ${message?.type}`);
		}
	}

	private async processContentMessage(
		message: IAutoMessage,
		sender: chrome.runtime.MessageSender
	): Promise<boolean> {
		try {
			switch (message?.type) {
				case AutoMessageType.ContentAwake:
				case AutoMessageType.ContentProgramActionResult:
					await Robot.instance.incomingEvent(sender.tab.id, message.type, message.data as RobotEventDataType);
					return true;
				default:
					return false;
			}
		} catch (error) {
			Logger.instance.error('processContentMessage Error.', error);
		}
	}

	private async processGlobalSettingsMessage(
		message: IAutoMessage,
		sender: chrome.runtime.MessageSender
	): Promise<boolean> {
		try {
			switch (message?.type) {
				case AutoMessageType.SetGlobalSettings:
					await Robot.instance.incomingEvent(null, message.type, message.data as RobotEventDataType);
					return true;
				default:
					return false;
			}
		} catch (error) {
			Logger.instance.error('processGlobalSettingsMessage Error.', error);
		}
	}
}
