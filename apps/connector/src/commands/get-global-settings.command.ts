import { Logger } from '@autochrome/core/common/logger';
import {
	AutoMessageType, IAutoMessageViewDataGetGlobalSettings
} from '@autochrome/core/messaging/i-auto-message';
import { BaseConnectorCommand } from './base-connector-command';
import { IRobotSettingsGlobal } from '@autochrome/core/settings/i-robot-settings-global';

export class GetGlobalSettingsCommand extends BaseConnectorCommand {
	public static commandName: string = 'get.settings';

    public getHelp(): string { return 'get.settings'; }

	public async invoke(parameters: string[]): Promise<void> {
		const settings = await this.send<IAutoMessageViewDataGetGlobalSettings, IRobotSettingsGlobal>(
			{type:AutoMessageType.GetGlobalSettings}
		);
		Logger.instance.log('Got Settings: ', settings);
		Logger.instance.log(`${parameters[0]} done.`);
	}
}

