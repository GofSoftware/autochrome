import { Logger } from '@autochrome/core/common/logger';
import { AutoActionName } from '@autochrome/core/program/actions/types/auto-action-name';
import { AutoActionResult } from '@autochrome/core/program/actions/types/auto-action-result';
import { TabManager } from '@autochrome/core/common/tab-manager';
import { ExtractedProgramContainer } from '@autochrome/core/program/container/extracted-program-container';
import { ExtractedProgramContainerManager } from '../container/extracted-program-container-manager';
import { RobotInterfaceLinkFacade } from '../robot-interface-link-facade';
import { ProgramContainerStatus } from '@autochrome/core/program/container/program-container-status';
import { IAutoMessageContentDataProgramActionResult, ProgramContainerAction } from '@autochrome/core/messaging/i-auto-message';
import { RobotSettingsGlobalManager } from '@autochrome/core/settings/robot-settings-global-manager';
import { ViewInterfaceLinkFacade } from '../view-interface-link-facade';
import { ErrorHelper } from '@autochrome/core/common/error-helper';

export const ROBOT_ACTION_TIMEOUT = 1; // In minutes.

export class Robot {
	private static robotInstance: Robot;

	public static get instance(): Robot {
		return Robot.robotInstance || (Robot.robotInstance = new Robot());
	}

	public async processContainerAction(containerId: string | null, action: ProgramContainerAction): Promise<void> {
		let containerForAction: ExtractedProgramContainer | null | undefined = null;
		if (containerId == null) {
			containerForAction = (await ExtractedProgramContainerManager.instance.getAllContainers())[0];
		} else {
			containerForAction = await ExtractedProgramContainerManager.instance.getContainer(containerId);
		}
		if (containerForAction == null) {
			return;
		}
		try {
			switch (action) {
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
					await ViewInterfaceLinkFacade.instance.sendProgramContainersUpdate([containerForAction.programContainer.toInfo()]);
					return;
				case ProgramContainerAction.Stop:
					containerForAction.programContainer.status = ProgramContainerStatus.Stopped;
					containerForAction.activeAction = null;
					await ExtractedProgramContainerManager.instance.setContainer(containerForAction);
					await ViewInterfaceLinkFacade.instance.sendProgramContainersUpdate([containerForAction.programContainer.toInfo()]);
					return;
			}
		} catch (error) {
			Logger.instance.error(
				`Robot.processContainerAction AutoMessageType.ContainerAction: ${action} error: ${(error as Error)?.message}`,
				error
			);
			containerForAction.programContainer.status = ProgramContainerStatus.Error;
			containerForAction.programContainer.error = ErrorHelper.genericErrorToString(error);
			await ExtractedProgramContainerManager.instance.setContainer(containerForAction);
			await ViewInterfaceLinkFacade.instance.sendProgramContainersUpdate([containerForAction.programContainer.toInfo()]);
		}
	}

	public async checkActionTimeout(): Promise<void> {
		const currentTime = Date.now();
		const allContainers = await ExtractedProgramContainerManager.instance.getInProgressContainers();
		const promises = allContainers.map(async (container) => {
			if (container.programContainer.activeActionStartTime + (ROBOT_ACTION_TIMEOUT * 60000) < currentTime) { // action timed out.
				await this.failProgramBecauseOfTimeout(
					container, `Action ${container.activeAction?.toString()} failed, the reason: timeout (${ROBOT_ACTION_TIMEOUT} min).`
				);
			}
		});
		await Promise.all(promises);
	}

	public async continueProgramForTab(tabId: number): Promise<void> {
		if (tabId == null) {
			throw new Error(`Robot.continueProgramForTab tabId is null`);
		}
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

	public async processActionResult(
		tabId: number,
		contentProgramActionResult: IAutoMessageContentDataProgramActionResult
	): Promise<void> {
		const activeProgramContainer = (await ExtractedProgramContainerManager.instance.getInProgressContainerForTab(tabId));
		if (activeProgramContainer == null) {
			Logger.instance.debug(`Action has completed for tab ${tabId}, result: ${contentProgramActionResult.result}, ` +
				`but there is no active program. The return value is:`, contentProgramActionResult.resultValue);
			return;
		}

		Logger.instance.log(`Action has completed for tab ${tabId}, result: ${contentProgramActionResult.result}. ` +
			`The return value is:`, contentProgramActionResult.resultValue);

		if (contentProgramActionResult.result === AutoActionResult.Success ||
			activeProgramContainer.activeAction?.continueAfterFail === true
		) {
			const nextActionId = this.extractNextActionId(activeProgramContainer, contentProgramActionResult);
			await this.continueProgram(activeProgramContainer, false, nextActionId);
			return;
		} else {
			await this.completeProgram(activeProgramContainer, contentProgramActionResult.error);
		}
	}

	private async continueProgram(
		activeProgramContainer: ExtractedProgramContainer | undefined,
		fromRoot: boolean = false,
		nextActionId: string | null = null
	): Promise<void> {
		if (activeProgramContainer == null) {
			Logger.instance.debug('Cannot continue a program, there is no active container.');
			return;
		}

		if (activeProgramContainer.programContainer.status === ProgramContainerStatus.Paused) {
			Logger.instance.debug(`Cannot continue a program, it's paused.`);
			return;
		}

		let nextAction = fromRoot ? activeProgramContainer.program.rootAction?.next : activeProgramContainer.activeAction?.next;

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
		activeProgramContainer.programContainer.status = ProgramContainerStatus.InProgress;
		activeProgramContainer.programContainer.error = null;
        activeProgramContainer.programContainer.tabId = activeProgramContainer.programContainer.tabId || await this.getCurrentTabId();
		await ExtractedProgramContainerManager.instance.setContainer(activeProgramContainer);

        Logger.instance.log(`Continue with the ${fromRoot ? 'root ' : ''}Action: ${nextAction.toString()}`);
		await RobotInterfaceLinkFacade.instance.sendNextAction(activeProgramContainer.programContainer.tabId, nextAction.toJson());
		await ViewInterfaceLinkFacade.instance.sendProgramContainersUpdate([activeProgramContainer.programContainer.toInfo()]);
	}

    private async getCurrentTabId(): Promise<number> {
        const tabs: chrome.tabs.Tab[] = await chrome.tabs.query({});
        const foundTabId = tabs.find((tab) => tab.active)?.id;
		if (foundTabId == null) {
			throw new Error(`Robot.getCurrentTabId - active tab not found`);
		}
		return foundTabId;
    }

	private async completeProgram(activeProgramContainer: ExtractedProgramContainer, error: string | null = null): Promise<void> {
		activeProgramContainer.activeAction = null;
		activeProgramContainer.programContainer.activeActionStartTime = 0;
		if (error == null) {
			activeProgramContainer.programContainer.status = ProgramContainerStatus.Completed;
		} else {
			activeProgramContainer.programContainer.error = error;
			activeProgramContainer.programContainer.status = ProgramContainerStatus.Error;
		}
		await ExtractedProgramContainerManager.instance.setContainer(activeProgramContainer);
		await ViewInterfaceLinkFacade.instance.sendProgramContainersUpdate([activeProgramContainer.programContainer.toInfo()]);

		Logger.instance.log(`Program completed for the tab: ${activeProgramContainer.programContainer.tabId}.`);

		const settings = await RobotSettingsGlobalManager.instance.getSettings();
		Logger.instance.log(`Autoplay is ${settings.autoPlay}`);
		if (settings.autoPlay) {
			await this.activateNextProgram(activeProgramContainer);
		}
	}

	private async failProgramBecauseOfTimeout(activeProgram: ExtractedProgramContainer, reason: string): Promise<void> {
		Logger.instance.log(`Program failed for the tab: ${activeProgram.programContainer.tabId}, reason: ${reason}`);
		activeProgram.activeAction = null;
		activeProgram.programContainer.status = ProgramContainerStatus.Error;
		activeProgram.programContainer.error = reason;
		activeProgram.programContainer.activeActionStartTime = 0;
		await ExtractedProgramContainerManager.instance.setContainer(activeProgram);
		await ViewInterfaceLinkFacade.instance.sendProgramContainersUpdate([activeProgram.programContainer.toInfo()]);
		await RobotInterfaceLinkFacade.instance.sendInterrupt(activeProgram.programContainer.tabId!, 'Interrupted by the server, ' + reason);
	}

	private extractNextActionId(
		activeProgramContainer: ExtractedProgramContainer,
		contentProgramResultData: IAutoMessageContentDataProgramActionResult
	): string | null {
		switch (activeProgramContainer.activeAction?.name) {
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
