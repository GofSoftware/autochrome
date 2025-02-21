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

export class WaitTimeCommand extends BaseConnectorCommand {
	public static commandName: string = 'wait.time';

    public getHelp(): string { return 'wait.time [time(ms)]'; }

	public async invoke(parameters: string[]): Promise<void> {
		await new Promise((resolve) => setTimeout(resolve, parseInt(parameters[1], 10)));
		Logger.instance.log(`${parameters[0]} done.`);
	}
}

