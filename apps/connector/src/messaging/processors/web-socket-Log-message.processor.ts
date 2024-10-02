import { IMessageProcessor } from "./i-message-processor";
import { IAutoMessageWebSocketLog } from '@autochrome/core/auto-link/messaging/i-auto-message';

export class WebSocketLogMessageProcessor implements IMessageProcessor<IAutoMessageWebSocketLog> {
    public static create(): WebSocketLogMessageProcessor {
        return new WebSocketLogMessageProcessor();
    }

    public async process(message: IAutoMessageWebSocketLog): Promise<void> {
        console.log(`Log, Id: ${message.clientId}, ${message.message}`);
    }
}
