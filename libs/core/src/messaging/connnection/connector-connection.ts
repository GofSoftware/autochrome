import { IConnectorConnection } from "./i-connector-connection";

export class ConnectorConnection implements IConnectorConnection {
    public static create(clientId: string): ConnectorConnection {
        return new ConnectorConnection(clientId);
    }
    constructor(public clientId: string) {}

    public close(): void {
        // do nothing for now
    }
}
