import { Logger } from '@autochrome/core/common/logger';
import {
	AutoMessageType,
	IAutoMessageViewDataGetBrowserTabList,
	IAutoMessageViewDataGetGlobalSettings,
	IAutoMessageViewDataGetProgramList,
	IBrowserTab
} from '@autochrome/core/messaging/i-auto-message';
import { BaseConnectorCommand } from './base-connector-command';
import { IProgramContainerInfo } from '@autochrome/core/program/container/i-program-container';
import { ConnectorContext } from '../connector-context';
import { BaseServerMessageTransporter } from '@autochrome/core/messaging/base-server-message.transporter';
import { Config } from '../config/config';
import { ProgramLoader } from '../config/program-loader';

export class CollectProgramsCommand extends BaseConnectorCommand {
	public static commandName: string = 'collect.programs';

	public async invoke(parameters: string[]): Promise<void> {
		const path = parameters[1];
		const search = parameters[2];
		if (path == null || search == null) {
			Logger.instance.error('Path and search are required.');
			return;
		}
		ProgramLoader.instance.collectPrograms(path, search);
		Logger.instance.log(`${parameters[0]} done.`);
	}
}

