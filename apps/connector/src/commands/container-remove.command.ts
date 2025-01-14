import { Logger } from '@autochrome/core/common/logger';
import { BaseConnectorCommand } from './base-connector-command';
import {
	AutoMessageType,
	IAutoMessageViewDataRemoveContainer
} from '@autochrome/core/messaging/i-auto-message';

export class ContainerRemoveCommand extends BaseConnectorCommand {
	public static commandName: string = 'container.remove';

	public async invoke(parameters: string[]): Promise<void> {
		if (parameters.length < 2) {
			throw new Error(`Please specify container id to remove.`);
		}
		await this.send<IAutoMessageViewDataRemoveContainer>({type: AutoMessageType.ContainerRemove, containerId: parameters[1]});

		Logger.instance.log(`${parameters[0]} done.`);
	}
}
