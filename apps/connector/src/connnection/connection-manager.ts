import { IConnectorConnection } from "./i-connector-connection";

export class ConnectionManager {
    private static connectionManagerInstance: ConnectionManager;
    public static get instance(): ConnectionManager {
        return ConnectionManager.connectionManagerInstance || (ConnectionManager.connectionManagerInstance = new ConnectionManager());
    }

    private connectionMap = new Map<string, IConnectorConnection>();

    public setConnection(connection: IConnectorConnection): void {
        if (this.connectionMap.has(connection.id)) {
            this.connectionMap.get(connection.id)!.close();
        }
        this.connectionMap.set(connection.id, connection);
    }
}
