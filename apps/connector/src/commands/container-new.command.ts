import { Logger } from '@autochrome/core/common/logger';
import { BaseConnectorCommand } from './base-connector-command';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { readFile } from 'node:fs/promises';
import { AutoMessageType, IAutoMessageViewDataNewContainer } from '@autochrome/core/messaging/i-auto-message';

export class ContainerNewCommand extends BaseConnectorCommand {
	public static commandName: string = 'container.new';

    public getHelp(): string { return 'container.new [program]'; }

	public async invoke(parameters: string[]): Promise<void> {
		if (parameters.length < 2) {
			throw new Error(`Please specify a file to upload.`);
		}
		const file = parameters[1];
		const filePath = resolve(file);
		if (!existsSync(filePath)) {
			throw new Error(`File not found: ${filePath}`);
		}

		const program = await readFile(filePath, { encoding: 'utf8' });

		await this.send<IAutoMessageViewDataNewContainer>({type: AutoMessageType.ContainerNew, container: program, tabId: null});

		Logger.instance.log(`${parameters[0]} done.`);
	}


}

