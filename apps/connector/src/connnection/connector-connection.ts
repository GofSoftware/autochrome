import { IConnectorConnection } from "./i-connector-connection";

export class ConnectorConnection implements IConnectorConnection {
    public static create(id: string): ConnectorConnection {
        return new ConnectorConnection(id);
    }
    constructor(public id: string) {}

    public close(): void {
        // do nothing for now
    }
}
