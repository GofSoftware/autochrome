import { Logger } from '@autochrome/core/common/logger';
import { BaseConnectorCommand } from './base-connector-command';
import {
	AutoMessageType, IAutoMessageViewDataContainerAction, ProgramContainerAction
} from '@autochrome/core/messaging/i-auto-message';

export class ContainerActionCommand extends BaseConnectorCommand {
	public static commandName: string = 'container.action';

    public getHelp(): string { return 'container.action [action] [containerId]'; }

    public async invoke(parameters: string[]): Promise<void> {
		if (parameters.length < 2) {
			throw new Error(`Please specify an action type and optionally container id.`);
		}

		await this.send<IAutoMessageViewDataContainerAction>(
			{type: AutoMessageType.ContainerAction, action: parameters[1] as ProgramContainerAction, containerId: parameters[2] ?? null}
		);

		Logger.instance.log(`${parameters[0]} done.`);
	}
}
