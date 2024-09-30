import {IMessageProcessor} from "./i-message-processor";
import {IAutoMessageWebSocketConnect} from "@autochrome/core/auto-link/messaging/i-auto-message";
import {ConnectionManager} from "../../connnection/connection-manager";
import {ConnectorConnection} from "../../connnection/connector-connection";

export class WebSocketConnectMessageProcessor implements IMessageProcessor<IAutoMessageWebSocketConnect> {
    public static create(): WebSocketConnectMessageProcessor {
        return new WebSocketConnectMessageProcessor();
    }

    public async process(message: IAutoMessageWebSocketConnect): Promise<void> {
        console.log(`New Connection, Id: ${message.clientId}`);
        ConnectionManager.instance.setConnection(ConnectorConnection.create(message.clientId));
    }
}
