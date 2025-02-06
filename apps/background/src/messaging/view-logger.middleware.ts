import { ILogger, LogSeverity } from '@autochrome/core/common/i-logger';
import { ViewInterfaceLinkFacade } from '../view-interface-link-facade';

export class ViewLoggerMiddleware implements ILogger {
	public static create(): ViewLoggerMiddleware {
		return new ViewLoggerMiddleware();
	}

	public debug(message: string, ...params: any[]) { this.sendLog(LogSeverity.debug, message, ...params); }
	public log(message: string, ...params: any[]) { this.sendLog(LogSeverity.log, message, ...params); }
	public warn(message: string, ...params: any[]) { this.sendLog(LogSeverity.warn, message, ...params); }
	public error(message: string, ...params: any[]) { this.sendLog(LogSeverity.error, message, ...params); }

	public sendLog(severity: LogSeverity, message: string, ...params: any[]): void {
		try {
			ViewInterfaceLinkFacade.instance.sendLog(this.createLogMessage(message, ...params), severity);
		} catch (error) {
            /*just skip error to not interrupt any important process*/
		}
	}

	private createLogMessage(message: string, ...params: any[]): string {
		return message + params.filter((p) => p != null).map((p) => {
			try {
				const mes = JSON.stringify(p);
				return `${mes.substring(0, 10000)}${mes.length > 10000 ? '...' : ''}`;
			} catch (error) {
				return p.toString();
			}
		}).join('\n');
	}
}
