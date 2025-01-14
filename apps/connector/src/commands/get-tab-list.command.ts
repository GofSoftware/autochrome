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

export class GetTabListCommand extends BaseConnectorCommand {
	public static commandName: string = 'get.tabs';

	public async invoke(parameters: string[]): Promise<void> {
		ConnectorContext.instance.browserTabs = await this.send<IAutoMessageViewDataGetBrowserTabList, IBrowserTab[]>(
			{type:AutoMessageType.GetBrowserTabList}
		);
		Logger.instance.log(
			'\n' + ConnectorContext.instance.browserTabs.map((tab) => `id: ${tab.id}, title: ${tab.title}, url: ${tab.url}`
		).join(';\n'));
		Logger.instance.log(`${parameters[0]} done.`);
	}
}

