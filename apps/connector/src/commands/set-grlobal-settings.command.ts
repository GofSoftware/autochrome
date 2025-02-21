import { Logger } from '@autochrome/core/common/logger';
import {
	AutoMessageType,
	IAutoMessageViewDataSetGlobalSettings
} from '@autochrome/core/messaging/i-auto-message';
import { IRobotSettingsGlobal } from '@autochrome/core/settings/i-robot-settings-global';
import { BaseConnectorCommand } from './base-connector-command';
import { OptionParser } from '@autochrome/core/common/option-parser';

export class SetGlobalSettingsCommand extends BaseConnectorCommand {
	public static commandName: string = 'set.settings';

    public getHelp(): string { return 'set.settings [optionName=value] [optionName=value]...'; }

	public async invoke(parameters: string[]): Promise<void> {
		const globalSettings: Partial<IRobotSettingsGlobal> = {};

		OptionParser.parse(
			parameters.slice(1),
			(name: string, value: string) => { this.setOption(globalSettings, name as keyof IRobotSettingsGlobal, value); }
		);

		if (Object.keys(globalSettings).length === 0) {
			Logger.instance.error('Error: Specify settings as the name=value pairs.');
			return;
		}

		await this.send<IAutoMessageViewDataSetGlobalSettings>({type:AutoMessageType.SetGlobalSettings, globalSettings: globalSettings!})
		Logger.instance.log(`${parameters[0]} done.`);
	}

	private setOption(destination: Partial<IRobotSettingsGlobal>, name: keyof IRobotSettingsGlobal, value: string): void {
		switch(name) {
			case 'autoPlay':
				destination.autoPlay = OptionParser.parseBoolean(value);
				break;
			case 'enableConnector':
				destination.enableConnector = OptionParser.parseBoolean(value);
				break;
			case 'enableConnectorLogging':
				destination.enableConnectorLogging = OptionParser.parseBoolean(value);
				break;
			case 'connectorPort':
				destination.connectorPort = OptionParser.parseInteger(value);
				break;
			case 'connectorHost':
				destination.connectorHost = value;
				break;
			default:
				Logger.instance.warn(`Wrong option: ${name}`);
		}
	}
}

