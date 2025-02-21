import { Logger } from '@autochrome/core/common/logger';
import {
	AutoMessageType, IAutoMessageViewDataGetProgramList
} from '@autochrome/core/messaging/i-auto-message';
import { BaseConnectorCommand } from './base-connector-command';
import { IProgramContainerInfo } from '@autochrome/core/program/container/i-program-container';
import { ConnectorContext } from '../connector-context';

export class GetProgramsCommand extends BaseConnectorCommand {
	public static commandName: string = 'get.programs';

    public getHelp(): string { return 'get.programs'; }

	public async invoke(parameters: string[]): Promise<void> {
		const programs = await this.send<IAutoMessageViewDataGetProgramList, IProgramContainerInfo[]>(
			{type:AutoMessageType.GetProgramList}
		);
		ConnectorContext.instance.programInfos = programs || [];
		this.logPrograms(programs, this.displayFull(parameters));
		Logger.instance.log(`${parameters[0]} done.`);
	}

	private displayFull(parameters: string[]): boolean {
		return parameters[1]?.toLowerCase() === 'full';
	}

	private logPrograms(programs: IProgramContainerInfo[], full: boolean): void {
		Logger.instance.log('Got Programs:');
		if (full) {
			programs.forEach((p) => {
				Logger.instance.log(`id: ${p.id} tabId: ${p.tabId}`);
			});
		} else {
			programs.forEach((p) => {
				Logger.instance.log(`${p.id}`);
			});
		}
	}
}

