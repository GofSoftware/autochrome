import { IMessageHandler } from "@autochrome/core/messaging/i-message-handler";
import { IAutoMessage, IAutoMessageViewDataLog } from '@autochrome/core/messaging/i-auto-message';
import { LogSeverity } from '@autochrome/core/common/i-logger';
import { Logger } from '@autochrome/core/common/logger';
import { Config } from '../../config/config';
import { appendFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export class WebSocketLogMessageHandler implements IMessageHandler<IAutoMessage<IAutoMessageViewDataLog>> {
    public static create(): WebSocketLogMessageHandler {
        return new WebSocketLogMessageHandler();
    }

    public async process(message: IAutoMessage<IAutoMessageViewDataLog>): Promise<void> {
		const data: IAutoMessageViewDataLog = message.data!;
		if (message.data.severity < Config.instance.backgroundLogSeverity) {
			return;
		}
		// const logMessage = `Log [${severityChar[data.severity] || '?'}], Client: ${message.clientId}, Message: ${data.message}`;
		const logMessage = data.message;
		if (Config.instance.logFile != null) {
			await this.toFile(logMessage);
		} else {
			this.toConsole(data.severity, logMessage);
		}
    }

	private toConsole(severity: LogSeverity, logMessage: string): void {
		switch (severity) {
			case LogSeverity.error:
				Logger.instance.error(logMessage);
				break;
			case LogSeverity.warn:
				Logger.instance.warn(logMessage);
				break;
			case LogSeverity.log:
				Logger.instance.log(logMessage);
				break;
			case LogSeverity.debug:
			default:
				Logger.instance.debug(logMessage);
		}
	}

	private async toFile(logMessage: string): Promise<void> {
		try {
			await appendFile(resolve(Config.instance.logFile!), `${logMessage}\n`);
		} catch (error) {
			Logger.instance.error('Error writing to log file.', error);
			Config.instance.logFile = null;
		}
	}

}
