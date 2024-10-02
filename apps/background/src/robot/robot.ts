import { Logger } from '@autochrome/core/common/logger';
import { AutoActionName } from '@autochrome/core/program/actions/types/auto-action-name';
import { AutoActionResult } from '@autochrome/core/program/actions/types/auto-action-result';
import { TabManager } from '@autochrome/core/common/tab-manager';
import { ExtractedProgramContainer } from '@autochrome/core/program/container/extracted-program-container';
import { ExtractedProgramContainerManager } from '@autochrome/core/auto-link/extracted-program-container-manager';
import { AutoLinkServer } from '@autochrome/core/auto-link/auto-link-server';
import { ProgramContainerStatus } from '@autochrome/core/program/container/program-container-status';
import {
    AutoMessageType,
    IAutoMessageContainerChangeType,
    IAutoMessageDataContainerAction,
    IAutoMessageDataContentAwake,
    IAutoMessageDataContentProgramAction,
    IAutoMessageDataContentProgramActionResult,
    IAutoMessageDataSetGlobalSettings,
    ProgramContainerAction
} from '@autochrome/core/auto-link/messaging/i-auto-message';
import { ErrorHelper } from '@autochrome/core/common/error-helper';
import { RobotSettingsGlobalManager } from '@autochrome/core/settings/robot-settings-global-manager';

export type RobotEventDataType =
	IAutoMessageDataContainerAction |
	IAutoMessageDataContentAwake |
	IAutoMessageDataContentProgramAction |
	IAutoMessageDataContentProgramActionResult |
	IAutoMessageDataSetGlobalSettings;

export type RobotEventType =
	AutoMessageType.ContainerAction |
	AutoMessageType.ContentAwake |
	AutoMessageType.ContentProgramActionResult |
	AutoMessageType.SetGlobalSettings;

export const ROBOT_ACTION_TIMEOUT = 0.5; // In minutes. // todo set back to one minute.

export class Robot {
	private static robotInstance: Robot;

	public static get instance(): Robot {
		return Robot.robotInstance || (Robot.robotInstance = new Robot());
	}

	private constructor() {
	}

	public async incomingEvent(senderId: number, type: RobotEventType, data: RobotEventDataType): Promise<void> {
		try {
			switch (type) {
				case AutoMessageType.ContentAwake:
					const contentAwakeData = data as IAutoMessageDataContentAwake;
					Logger.instance.log(`Got ContentAwake from tab: ${senderId}, now: ${contentAwakeData.now}`);
					await this.continueProgramForTab(senderId);
					break;
				case AutoMessageType.ContentProgramActionResult:
					const contentProgramResultData = data as IAutoMessageDataContentProgramActionResult;
					await this.processActionResult(senderId, contentProgramResultData);
					break;
				case AutoMessageType.ContainerAction:
					const containerActionData = data as IAutoMessageDataContainerAction;
					await this.processContainerAction(senderId, containerActionData);
					break;
				case AutoMessageType.SetGlobalSettings:
					const settings = data as IAutoMessageDataSetGlobalSettings;
					await this.processSetGlobalSettings(senderId, settings);
					break;
				default:
					Logger.instance.warn(`Unknown Robot incoming event: ${type}`);
			}
		} catch (error) {
			Logger.instance.error('ContentMessageProcessor Error.', error);
		}
	}

	public async checkActionTimeout(): Promise<void> {
		const currentTime = Date.now();
		const allContainers = await ExtractedProgramContainerManager.instance.getInProgressContainers();
		const promises = allContainers.map(async (container) => {
			if (container.programContainer.activeActionStartTime + (ROBOT_ACTION_TIMEOUT * 60000) < currentTime) { // action timed out.
				await this.failProgram(
					container, `Action ${container.activeAction.toString()} failed, the reason: timeout (${ROBOT_ACTION_TIMEOUT} min).`
				);
			}
		});
		await Promise.all(promises);
	}

	private async continueProgramForTab(tabId: number): Promise<void> {
		const containers = (await ExtractedProgramContainerManager.instance.getContainersForTab(tabId));
		if (containers.length === 0) {
			Logger.instance.log(`There is no program for the tab: ${tabId} (${TabManager.instance.title(tabId)})`);
			return;
		}
		const activeProgramContainer = (await ExtractedProgramContainerManager.instance.getInProgressContainerForTab(tabId));
		const activeProgramName = activeProgramContainer == null ? 'none' : activeProgramContainer.program.name;
		Logger.instance.log(`There are programs for the tab: ${tabId} (${TabManager.instance.title(tabId)}) ` +
			`total: ${containers.length}, active: "${activeProgramName}"`);

		await this.continueProgram(activeProgramContainer);
	}

	private async continueProgram(
		activeProgramContainer: ExtractedProgramContainer,
		fromRoot: boolean = false,
		nextActionId: string = null
	): Promise<void> {
		if (activeProgramContainer == null) {
			Logger.instance.debug('Cannot continue a program, there is no active container.');
			return;
		}

		if (activeProgramContainer.programContainer.status === ProgramContainerStatus.Paused) {
			Logger.instance.debug(`Cannot continue a program, it's paused.`);
			return;
		}

		let nextAction = fromRoot ? activeProgramContainer.program.rootAction?.next : activeProgramContainer.activeAction.next;

		if (nextActionId != null) {
			nextAction = activeProgramContainer.program.getActionById(nextActionId);
			if (nextAction == null) {
				await this.completeProgram(activeProgramContainer, `Cannot find an Action with id ${nextActionId}`);
				return;
			}
		}

		if (nextAction == null) {
			await this.completeProgram(activeProgramContainer);
			return;
		}

		activeProgramContainer.activeAction = nextAction;
		activeProgramContainer.programContainer.activeActionStartTime = Date.now();
		activeProgramContainer.programContainer.status = ProgramContainerStatus.InProgress;
		activeProgramContainer.programContainer.error = null;
        activeProgramContainer.programContainer.tabId = activeProgramContainer.programContainer.tabId || await this.getCurrentTabId();
		await ExtractedProgramContainerManager.instance.setContainer(activeProgramContainer);

        Logger.instance.log(`Continue with the ${fromRoot ? 'root ' : ''}Action: ${nextAction.toString()}`);
		await AutoLinkServer.instance.sendNextAction(activeProgramContainer.programContainer.tabId, nextAction.toJson());
		await AutoLinkServer.instance.sendContainerUpdate(activeProgramContainer.programContainer.id, IAutoMessageContainerChangeType.Update);
	}

    private async getCurrentTabId(): Promise<number> {
        const tabs: chrome.tabs.Tab[] = await chrome.tabs.query({});
        return tabs.find((tab) => tab.active)?.id;
    }

	private async completeProgram(activeProgramContainer: ExtractedProgramContainer, error: string = null): Promise<void> {
        Logger.instance.log(`Program completed for the tab: ${activeProgramContainer.programContainer.tabId}.`);
		activeProgramContainer.activeAction = null;
		activeProgramContainer.programContainer.activeActionStartTime = 0;
		if (error == null) {
			activeProgramContainer.programContainer.status = ProgramContainerStatus.Completed;
		} else {
			activeProgramContainer.programContainer.error = error;
			activeProgramContainer.programContainer.status = ProgramContainerStatus.Error;
		}
		await ExtractedProgramContainerManager.instance.setContainer(activeProgramContainer);
		await AutoLinkServer.instance.sendContainerUpdate(activeProgramContainer.programContainer.id, IAutoMessageContainerChangeType.Update);

		const settings = await RobotSettingsGlobalManager.instance.getSettings();
		Logger.instance.log(`Autoplay is ${settings.autoPlay}`);
		if (settings.autoPlay) {
			await this.activateNextProgram(activeProgramContainer);
		}
	}

	private async failProgram(activeProgram: ExtractedProgramContainer, reason: string): Promise<void> {
		Logger.instance.log(`Program failed for the tab: ${activeProgram.programContainer.tabId}, reason: ${reason}`);
		activeProgram.activeAction = null;
		activeProgram.programContainer.status = ProgramContainerStatus.Error;
		activeProgram.programContainer.error = reason;
		activeProgram.programContainer.activeActionStartTime = 0;
		await ExtractedProgramContainerManager.instance.setContainer(activeProgram);
		await AutoLinkServer.instance.sendContainerUpdate(activeProgram.programContainer.id, IAutoMessageContainerChangeType.Update);
		await AutoLinkServer.instance.sendInterrupt(activeProgram.programContainer.tabId, 'Interrupted by the server, ' + reason);
	}

	private async processActionResult(
		senderId: number,
		contentProgramActionResult: IAutoMessageDataContentProgramActionResult
	): Promise<void> {
		const activeProgramContainer = (await ExtractedProgramContainerManager.instance.getInProgressContainerForTab(senderId));
		if (activeProgramContainer == null) {
			Logger.instance.debug(`Action has completed for tab ${senderId}, result: ${contentProgramActionResult.result}, ` +
				`but there is no active program. The return value is:`, contentProgramActionResult.resultValue);
			return;
		}

		Logger.instance.log(`Action has completed for tab ${senderId}, result: ${contentProgramActionResult.result}. ` +
			`The return value is:`, contentProgramActionResult.resultValue);

		if (contentProgramActionResult.result === AutoActionResult.Success ||
			activeProgramContainer.activeAction.continueAfterFail === true
		) {
			const nextActionId = this.extractNextActionId(activeProgramContainer, contentProgramActionResult);
			await this.continueProgram(activeProgramContainer, false, nextActionId);
			return;
		} else {
			await this.completeProgram(activeProgramContainer, contentProgramActionResult.error);
		}
	}

	private async processContainerAction(
		senderId: number,
		containerActionData: IAutoMessageDataContainerAction
	): Promise<void> {
		const containerIdForAction = containerActionData.containerId;
		const containerForAction = await ExtractedProgramContainerManager.instance.getContainer(containerIdForAction);
		if (containerForAction == null) {
			return;
		}
		try {
			switch (containerActionData.action) {
                case ProgramContainerAction.Play:
					let fromRoot = true;
					if (containerForAction.programContainer.status === ProgramContainerStatus.Paused) {
						fromRoot = false;
						containerForAction.programContainer.status = ProgramContainerStatus.InProgress;
					}
					await this.continueProgram(containerForAction, fromRoot);
					return;
				case ProgramContainerAction.Pause:
					containerForAction.programContainer.status = ProgramContainerStatus.Paused;
					await ExtractedProgramContainerManager.instance.setContainer(containerForAction);
					await AutoLinkServer.instance.sendContainerUpdate(containerIdForAction, IAutoMessageContainerChangeType.Update);
					return;
				case ProgramContainerAction.Stop:
					containerForAction.programContainer.status = ProgramContainerStatus.Stopped;
					containerForAction.activeAction = null;
					await ExtractedProgramContainerManager.instance.setContainer(containerForAction);
					await AutoLinkServer.instance.sendContainerUpdate(containerIdForAction, IAutoMessageContainerChangeType.Update);
					return;
			}
		} catch (error) {
			Logger.instance.error('BackgroundMessageProcessor AutoMessageType.ContainerAction error:', error);
			containerForAction.programContainer.status = ProgramContainerStatus.Error;
			containerForAction.programContainer.error = ErrorHelper.genericErrorToString(error);
			await ExtractedProgramContainerManager.instance.setContainer(containerForAction);
			await AutoLinkServer.instance.sendContainerUpdate(containerIdForAction, IAutoMessageContainerChangeType.Update);
		}
	}

	private extractNextActionId(
		activeProgramContainer: ExtractedProgramContainer,
		contentProgramResultData: IAutoMessageDataContentProgramActionResult
	): string {
		switch (activeProgramContainer.activeAction.name) {
			case AutoActionName.AutoActionCase:
				return contentProgramResultData.resultValue;
			case AutoActionName.AutoActionCaseParameter:
				return contentProgramResultData.resultValue;
			case AutoActionName.AutoActionGoTo:
				return contentProgramResultData.resultValue;
			default:
				return null;
		}
	}

	private async processSetGlobalSettings(senderId: number, globalSettingsData: IAutoMessageDataSetGlobalSettings): Promise<void> {
		await RobotSettingsGlobalManager.instance.setSettings(globalSettingsData.globalSettings);
	}

	private async activateNextProgram(previousProgramContainer: ExtractedProgramContainer): Promise<void> {
		Logger.instance.log(`Activating the next program.`);
		const nextContainer = await ExtractedProgramContainerManager.instance.getNextContainerForTab(previousProgramContainer);
		if (nextContainer != null) {
			await this.continueProgram(nextContainer, true);
		} else {
			Logger.instance.log(`No next program has been found, exit processing.`);
		}
	}
}
