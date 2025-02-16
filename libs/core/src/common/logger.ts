import { ILogger, LogSeverity, severityChar } from './i-logger';

export class Logger implements ILogger {
	private static loggerPrefix = 'Unset';
	private static loggerInstance: Logger;
	public static get instance(): Logger {
		return Logger.loggerInstance || (Logger.loggerInstance = new Logger());
	}

    public middleware = new Map<string, ILogger>();

	public get prefix(): string {
		return `${Logger.loggerPrefix} [${(new Date()).toISOString()}]`;
	}

	public set prefix(value: string) {
		Logger.loggerPrefix = value;
	}

	public severity: LogSeverity = LogSeverity.debug;

	public debug(message: string, ...params: any[]): void {
		if (LogSeverity.debug >= this.severity) {
			console.debug(this.prefixMessage(message, LogSeverity.debug), ...params);
		}
		this.middleware.forEach((logger) => {
			try {
				logger.debug(this.prefixMessage(message, LogSeverity.debug), ...params);
			} catch (e){
				// Ignore
			}
		});
	}

	public log(message: string, ...params: any[]): void {
		if (LogSeverity.log >= this.severity) {
			console.log(this.prefixMessage(message, LogSeverity.log), ...params);
		}
		this.middleware.forEach((logger) => {
			try {
				logger.log(this.prefixMessage(message, LogSeverity.log), ...params);
			} catch (e){
				// Ignore
			}
		});
	}

	public warn(message: string, ...params: any[]): void {
		if (LogSeverity.warn >= this.severity) {
			console.warn(this.prefixMessage(message, LogSeverity.warn), ...params);
		}
		this.middleware.forEach((logger) => {
			try {
				logger.warn(this.prefixMessage(message, LogSeverity.warn), ...params);
			} catch (e){
				// Ignore
			}
		});
	}

	public error(message: string, ...params: any[]): void {
		if (LogSeverity.error >= this.severity) {
			console.error(this.prefixMessage(message, LogSeverity.error), ...params);
		}
		this.middleware.forEach((logger) => {
			try {
				logger.error(this.prefixMessage(message, LogSeverity.error), ...params);
			} catch (e){
				// Ignore
			}
		});
	}

    private prefixMessage(message: string, severity: LogSeverity): string {
        return `${this.prefix} [${severityChar[severity] || '?'}] ${message}`;
    }
}
