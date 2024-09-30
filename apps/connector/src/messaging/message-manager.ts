import {AutoMessageType, IAutoMessage, IAutoMessageWebSocketConnect} from "@autochrome/core/auto-link/messaging/i-auto-message";
import {WebSocketConnectMessageProcessor} from "./processors/web-socket-connect-message.processor";

export class MessageManager {
    private static messageProcessorInstance: MessageManager;
    public static get instance(): MessageManager {
        return MessageManager.messageProcessorInstance || (MessageManager.messageProcessorInstance = new MessageManager());
    }

    public async processMessage(message: string): Promise<void> {
        const autoMessage = this.parse(message);
        switch (autoMessage.type) {
            case AutoMessageType.WebSocketConnect:
                await WebSocketConnectMessageProcessor.create().process(autoMessage.data as IAutoMessageWebSocketConnect);
                break;
            default:
                console.error(`MessageManager.processMessage Error: Unknown autoMessage type ${autoMessage.type}`);
        }
    }

    private parse(message: string): IAutoMessage {
        try {
            const autoMessage = JSON.parse(message);
            if (typeof autoMessage.type !== "string" || typeof autoMessage.data === "undefined") {
                throw new Error('The message is not an IAutoMessage');
            }
            return autoMessage
        } catch (error) {
            console.error(error);
        }
        return null;
    }
}
