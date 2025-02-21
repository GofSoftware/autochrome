import { Logger } from '@autochrome/core/common/logger';
import {
	AutoMessageType, IAutoMessageViewDataCloseBrowserTab
} from '@autochrome/core/messaging/i-auto-message';
import { BaseConnectorCommand } from './base-connector-command';

export class CloseTabCommand extends BaseConnectorCommand {
	public static commandName: string = 'close.tab';

    public getHelp(): string { return 'close.tab [tabUrlOrTitle]'; }

    public async invoke(parameters: string[]): Promise<void> {
		if (parameters[1] == null) {
			Logger.instance.warn(`Tab id, url or title is required.`);
		}
		const tabId = this.getTabId(parameters[1]);
		const tabUrlOrTitle = tabId == null ? parameters[1] : null;
		await this.send<IAutoMessageViewDataCloseBrowserTab>({type: AutoMessageType.CloseBrowserTab, tabUrlOrTitle, tabId});

		Logger.instance.log(`${parameters[0]} done.`);
	}

	private getTabId(parameter: string): number | null {
		const tabId = parseInt(parameter, 10);
		if (isNaN(tabId)) {
			return null;
		}
		return tabId;
	}
}

