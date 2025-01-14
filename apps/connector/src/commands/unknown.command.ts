import { IConnectorCommand } from './i-connector-command';
import { Logger } from '@autochrome/core/common/logger';

export class UnknownCommand implements IConnectorCommand {
	public async invoke(parameters: string[]): Promise<void> {
		Logger.instance.log(`Unknown command: ${parameters[0]}.`);
	}
}
