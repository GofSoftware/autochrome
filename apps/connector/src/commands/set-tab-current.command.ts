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

export class SetTabCurrentCommand extends BaseConnectorCommand {
	public static commandName: string = 'set.tab';

	public async invoke(parameters: string[]): Promise<void> {
		const tab = (ConnectorContext.instance.browserTabs || []).find(
			(t) => t.id.toString() === parameters[1] || t.title === parameters[1] || t.url === parameters[1]
		);
		if (tab != null) {
			ConnectorContext.instance.currentTab = tab;
			Logger.instance.log(`The current tab: `, tab);
		} else {
			throw new Error(`Tab "${parameters[1]}" not found.`);
		}
		Logger.instance.log(`${parameters[0]} done.`);
	}
}

