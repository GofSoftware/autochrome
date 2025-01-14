export interface IConnectorCommand {
	invoke(parameters: string[]): Promise<void>;
}
