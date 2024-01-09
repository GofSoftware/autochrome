import { AutoStorage } from '../common/auto-storage';

export interface IRobotSettingsGlobal {
	autoPlay: boolean;
}

const DEFAULT_ROBOT_SETTINGS_GLOBAL: IRobotSettingsGlobal = {
	autoPlay: true
};

export const ROBOT_SETTINGS_GLOBAL_STORAGE_KEY = 'globalSettings';

export class RobotSettingsGlobal {
	private static autoSettingsGlobalInstance: RobotSettingsGlobal;
	public static get instance(): RobotSettingsGlobal {
		return RobotSettingsGlobal.autoSettingsGlobalInstance || (RobotSettingsGlobal.autoSettingsGlobalInstance = new RobotSettingsGlobal());
	}

	private settingsInstance: IRobotSettingsGlobal = null;

	public async getSettings(): Promise<Readonly<IRobotSettingsGlobal>> {
		if (this.settingsInstance == null) {
			const settings = await AutoStorage.instance.get(ROBOT_SETTINGS_GLOBAL_STORAGE_KEY);
			this.settingsInstance = Object.assign(DEFAULT_ROBOT_SETTINGS_GLOBAL, settings[ROBOT_SETTINGS_GLOBAL_STORAGE_KEY]);
		}
		return this.settingsInstance;
	}

	public async setSettings(settings: Partial<IRobotSettingsGlobal>): Promise<void> {
		const currentSettings = await this.getSettings();
		const newSettings = Object.assign(currentSettings, settings);
		await AutoStorage.instance.set({[ROBOT_SETTINGS_GLOBAL_STORAGE_KEY]: newSettings});
	}
}
