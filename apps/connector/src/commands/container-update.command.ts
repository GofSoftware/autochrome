import { Logger } from '@autochrome/core/common/logger';
import { BaseConnectorCommand } from './base-connector-command';
import {
	AutoMessageType, IAutoMessageViewDataSeveralContainersUpdate
} from '@autochrome/core/messaging/i-auto-message';
import { OptionParser } from '@autochrome/core/common/option-parser';
import { IProgramContainerInfo } from '@autochrome/core/program/container/i-program-container';

export class ContainerUpdateCommand extends BaseConnectorCommand {
	public static commandName: string = 'container.update';

	public async invoke(parameters: string[]): Promise<void> {
		if (parameters.length < 2) {
			throw new Error(`Please specify IProgramContainerUpdateInfo field=value pairs to update.`);
		}

		const programContainerUpdateInfo: Partial<IProgramContainerInfo> = {};

		OptionParser.parse(
			parameters.slice(1),
			(name: string, value: string) => {
				this.setOption(programContainerUpdateInfo, name as keyof IProgramContainerInfo, value);
			}
		);

		if (Object.keys(programContainerUpdateInfo).length === 0) {
			Logger.instance.error('Please specify IProgramContainerUpdateInfo field=value pairs to update.');
			return;
		}

		if (programContainerUpdateInfo.id === '') {
			Logger.instance.error('Container id is required.');
			return;
		}

		const containerInfos = [programContainerUpdateInfo];
		await this.send<IAutoMessageViewDataSeveralContainersUpdate>({type: AutoMessageType.SeveralContainersUpdate, containerInfos});

		Logger.instance.log(`${parameters[0]} done.`);
	}

	private setOption(destination: Partial<IProgramContainerInfo>, name: keyof IProgramContainerInfo, value: string): void {
		switch(name) {
			case 'id':
				destination.id = value;
				break;
			case 'tabId':
				destination.tabId = OptionParser.parseInteger(value);
				break;
			default:
				Logger.instance.warn(`Wrong option: ${name as string}`);
		}
	}
}
