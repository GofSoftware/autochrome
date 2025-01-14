import { Logger } from '@autochrome/core/common/logger';
import { BaseConnectorCommand } from './base-connector-command';
import { ConnectorContext } from '../connector-context';
import { ProgramContainerStatus } from '@autochrome/core/program/container/program-container-status';

const DEFAULT_TIMEOUT = 60 * 60 * 1000

export class WaitProgramsCommand extends BaseConnectorCommand {
	public static commandName: string = 'wait.programs';

	public async invoke(parameters: string[]): Promise<void> {
		await new Promise<void>((resolve, reject) => {
			let timeout: number | null = null;
			let interval: number | null = null;

			let time = parseInt(parameters[1], 10);
			time = isNaN(time) ? DEFAULT_TIMEOUT : time

			timeout = setTimeout(
				() => {
					clearInterval(interval!);
					reject(new Error(`wait.programs timeout (${time})`));
				},
				time
			) as unknown as number;
			interval = setInterval(() => {
				const allDone = ConnectorContext.instance.programInfos.every((p) =>
					p.status === ProgramContainerStatus.Stopped ||
					p.status === ProgramContainerStatus.Completed ||
					p.status === ProgramContainerStatus.Error
				);
				if (allDone) {
					clearTimeout(timeout);
					clearInterval(interval!);
					resolve();
				}
			}, 50) as unknown as number;
		});
		Logger.instance.log(`${parameters[0]} done.`);
	}
}
