import { ILogger } from './i-logger';

export class Logger implements ILogger {
	private static loggerPrefix = 'Unset';
	private static loggerInstance: Logger;
	public static get instance(): Logger {
		return Logger.loggerInstance || (Logger.loggerInstance = new Logger());
	}

    public middleware: ILogger;

	public get prefix(): string {
		return `${Logger.loggerPrefix} [${(new Date()).toISOString()}]`;
	}

	public set prefix(value: string) {
		Logger.loggerPrefix = value;
	}

	public debug(message: string, ...params: any[]): void {
        if (this.middleware) {
            this.middleware.debug(this.prefixMessage(message), ...params);
        }
		console.debug(this.prefixMessage(message), ...params);
	}

	public log(message: string, ...params: any[]): void {
        if (this.middleware) {
            this.middleware.log(this.prefixMessage(message), ...params);
        }
		console.log(this.prefixMessage(message), ...params);
	}

	public warn(message: string, ...params: any[]): void {
        if (this.middleware) {
            this.middleware.warn(this.prefixMessage(message), ...params);
        }
		console.warn(this.prefixMessage(message), ...params);
	}

	public error(message: string, ...params: any[]): void {
        if (this.middleware) {
            this.middleware.error(this.prefixMessage(message), ...params);
        }
		console.error(this.prefixMessage(message), ...params);
	}

    private prefixMessage(message: string): string {
        return `${this.prefix} ${message}`;
    }
}
