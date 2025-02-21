import { Logger } from '@autochrome/core/common/logger';
import { AutoMessageType, IAutoMessageViewDataClearAllContainers } from '@autochrome/core/messaging/i-auto-message';
import { BaseConnectorCommand } from './base-connector-command';

export class ContainerClearAllProgramItemsCommand extends BaseConnectorCommand {
	public static commandName: string = 'container.clear';

    public getHelp(): string { return 'container.clear'; }

	public async invoke(parameters: string[]): Promise<void> {
		await this.send<IAutoMessageViewDataClearAllContainers>({type:AutoMessageType.ContainerClearAll})
		Logger.instance.log(`${parameters[0]} done.`);
	}
}

