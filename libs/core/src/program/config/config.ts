export interface IConfig {
	globalTimeout: number;
}

export class Config implements IConfig {
	private static configInstance: Config;
	public static get instance(): Config {
		return Config.configInstance || (Config.configInstance = new Config());
	}

	private globalTimeoutHolder = 60000;

	public applySettings(config: IConfig): void {
		if (config.globalTimeout != null) {
			this.globalTimeoutHolder = config.globalTimeout;
		}
	}

	public get globalTimeout(): number {
		return this.globalTimeoutHolder;
	}
}
