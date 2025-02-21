import { Logger } from '@autochrome/core/common/logger';
import { BaseConnectorCommand } from './base-connector-command';
import { AutoMessageType, IAutoMessageViewDataNewContainer } from '@autochrome/core/messaging/i-auto-message';
import { ConnectorContext } from '../connector-context';

export class ContainerUploadCollectedCommand extends BaseConnectorCommand {
	public static commandName: string = 'container.upload';

    public getHelp(): string { return 'container.upload'; }

	public async invoke(parameters: string[]): Promise<void> {
		if (ConnectorContext.instance.programs?.length == 0) {
			Logger.instance.log(`Nothing to upload, collect programs first.`);
			return;
		}

		for (let program of ConnectorContext.instance.programs) {
			await this.send<IAutoMessageViewDataNewContainer>({
				type: AutoMessageType.ContainerNew,
				container: program,
				tabId: ConnectorContext.instance.currentTab?.id ?? null
			});
		}

		Logger.instance.log(`${parameters[0]} done.`);
	}
}
