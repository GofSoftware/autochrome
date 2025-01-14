import { AutoStorage } from '../common/auto-storage';
import { IRobotSettingsGlobal } from "./i-robot-settings-global";

const DEFAULT_ROBOT_SETTINGS_GLOBAL: IRobotSettingsGlobal = {
	autoPlay: true,
    enableConnector: false,
    enableConnectorLogging: true,
    connectorPort: 3101,
    connectorHost: "localhost"
};

export const ROBOT_SETTINGS_GLOBAL_STORAGE_KEY = 'globalSettings';
/**
 * It is impossible for now to see the chrome.storage in the dev tool, so run the following snippet in the dev console to see the data.
 * chrome.storage.local.get(function(result){console.log(result)})
 */
export class RobotSettingsGlobalManager {
	private static autoSettingsGlobalInstance: RobotSettingsGlobalManager;
	public static get instance(): RobotSettingsGlobalManager {
		return RobotSettingsGlobalManager.autoSettingsGlobalInstance || (RobotSettingsGlobalManager.autoSettingsGlobalInstance = new RobotSettingsGlobalManager());
	}

	private settingsInstance: IRobotSettingsGlobal | null = null;

	public async getSettings(): Promise<Readonly<IRobotSettingsGlobal>> {
		if (this.settingsInstance == null) {
			const settings = await AutoStorage.instance.get(ROBOT_SETTINGS_GLOBAL_STORAGE_KEY);
			this.settingsInstance = Object.assign(DEFAULT_ROBOT_SETTINGS_GLOBAL, settings[ROBOT_SETTINGS_GLOBAL_STORAGE_KEY]);
		}
		return this.settingsInstance!;
	}

	public async setSettings(settings: Partial<IRobotSettingsGlobal>): Promise<void> {
		const currentSettings = await this.getSettings();
		const newSettings = Object.assign(currentSettings, settings);
		await AutoStorage.instance.set({[ROBOT_SETTINGS_GLOBAL_STORAGE_KEY]: newSettings});
	}
}
