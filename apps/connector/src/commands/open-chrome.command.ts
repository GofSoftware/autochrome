import { Logger } from '@autochrome/core/common/logger';
import { BaseConnectorCommand } from './base-connector-command';
import childProc from 'child_process';

export class OpenChromeCommand extends BaseConnectorCommand {
	public static commandName: string = 'open.chrome';

	public async invoke(parameters: string[]): Promise<void> {
		await new Promise<void>((resolve, reject) => {
			try {
				const url = parameters[1] || '';
				childProc.exec(`"C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe" ${url}`, (error, stdout, stderr) => {
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
		});
		Logger.instance.log(`${parameters[0]} done.`);
	}
}

