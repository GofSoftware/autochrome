import { Logger } from '@autochrome/core/common/logger';
import { BaseConnectorCommand } from './base-connector-command';
import childProc from 'child_process';

export class OpenChromeCommand extends BaseConnectorCommand {
	public static commandName: string = 'open.chrome';

    public getHelp(): string { return 'open.chrome [URL?] [FullPathToChrome]'; }

	public async invoke(parameters: string[]): Promise<void> {
		// Do not wait, it looks like callback should only invoke at the end of the process life.
		new Promise<void>((resolve, reject) => {
			try {
				const url = parameters[1] || '';
				const chromePath = parameters[2] ? decodeURIComponent(parameters[2]) : 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
				childProc.exec(`"${chromePath}" ${url}`, (error, stdout, stderr) => {
					if (error) {
						reject(error);
					}
					if (stderr) {
						reject();
					}
					resolve();
				});
			} catch (error) {
				reject(error);
			}
		}).catch((error) => {
				Logger.instance.error('open.chrome error', error || '_null_');
		});
		Logger.instance.log(`${parameters[0]} done.`);
	}
}

