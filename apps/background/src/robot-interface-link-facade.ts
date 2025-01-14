import {
	AutoMessageType, IAutoMessageContentDataProgramAction
} from '@autochrome/core/messaging/i-auto-message';
import { IAutoAction } from '@autochrome/core/program/actions/types/i-auto-action';
import { BaseLinkFacade } from '@autochrome/core/auto-link/base-link-facade';

export class RobotInterfaceLinkFacade extends BaseLinkFacade {
	private static robotActionLinkFacadeInstance: RobotInterfaceLinkFacade;
	public static get instance(): RobotInterfaceLinkFacade {
		return RobotInterfaceLinkFacade.robotActionLinkFacadeInstance ||
			(RobotInterfaceLinkFacade.robotActionLinkFacadeInstance = new RobotInterfaceLinkFacade());
	}

	public async sendNextAction(tabId: number, action: IAutoAction): Promise<void> {
		const data: IAutoMessageContentDataProgramAction = {type: AutoMessageType.ContentProgramAction, action}
		await this.sendToAll(data, true, tabId.toString());
	}

	public async sendInterrupt(tabId: number, reason: string): Promise<void> {
		const data = {type: AutoMessageType.ContentProgramInterrupt, tabId, reason}
		await this.sendToAll(data, true, tabId.toString());
	}
}
