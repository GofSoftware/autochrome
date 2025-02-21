import { Logger } from '@autochrome/core/common/logger';
import { BaseConnectorCommand } from './base-connector-command';
import { ConnectorContext } from '../connector-context';

const DEFAULT_TIMEOUT = 30 * 1000

export class WaitConnectionCommand extends BaseConnectorCommand {
	public static commandName: string = 'wait.connection';

    public getHelp(): string { return 'wait.connection [timeToWait(ms)]'; }

	public async invoke(parameters: string[]): Promise<void> {
		await new Promise<void>((resolve, reject) => {
			let timeout: number | null = null;
			let interval: number | null = null;

			let time = parseInt(parameters[1], 10);
			time = isNaN(time) ? DEFAULT_TIMEOUT : time

			timeout = setTimeout(
				() => {
					clearInterval(interval!);
					reject(new Error(`wait.connection timeout (${time})`));
				},
				time
			) as unknown as number;
			interval = setInterval(() => {
				if (ConnectorContext.instance.connected) {
					clearTimeout(timeout);
					clearInterval(interval!);
					resolve();
				}
			}, 50) as unknown as number;
		});
		Logger.instance.log(`${parameters[0]} done.`);
	}
}
