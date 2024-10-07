import { IMessageProcessor } from "./i-message-processor";
import { IAutoMessageWebSocketLog, WebSocketLogSeverity } from '@autochrome/core/auto-link/messaging/i-auto-message';
import { Config } from '../../config/config';

export class WebSocketLogMessageProcessor implements IMessageProcessor<IAutoMessageWebSocketLog> {
    public static create(): WebSocketLogMessageProcessor {
        return new WebSocketLogMessageProcessor();
    }

    public async process(message: IAutoMessageWebSocketLog): Promise<void> {
        if (message.severity >= Config.instance.logSeverity) {
            switch (message.severity) {
                case WebSocketLogSeverity.Warning:
                    console.warn(`Log, Id: ${message.clientId}, ${message.message}`);
                    break;
                case WebSocketLogSeverity.Error:
                    console.error(`Log, Id: ${message.clientId}, ${message.message}`);
                    break;
                case WebSocketLogSeverity.Debug:
                case WebSocketLogSeverity.Info:
                default:
                    console.log(`Log, Id: ${message.clientId}, ${message.message}`);
            }
        }
    }
}
