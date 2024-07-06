export class Logger {
	private static loggerPrefix: string = 'Unset';
	private static loggerInstance: Logger;
	public static get instance(): Logger {
		return Logger.loggerInstance || (Logger.loggerInstance = new Logger());
	}

	public get prefix(): string {
		return `${Logger.loggerPrefix} [${(new Date()).toISOString()}]`;
	}

	public set prefix(value: string) {
		Logger.loggerPrefix = value;
	}

	public debug(message: string, ...params: any[]): void {
		console.debug(`${this.prefix} ${message}`, ...params);
	}

	public log(message: string, ...params: any[]): void {
		console.log(`${this.prefix} ${message}`, ...params);
	}

	public warn(message: string, ...params: any[]): void {
		console.warn(`${this.prefix} ${message}`, ...params);
	}

	public error(message: string, ...params: any[]): void {
		console.error(`[${this.prefix}] ${message}`, ...params);
	}

}
