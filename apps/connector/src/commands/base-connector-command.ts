import { IConnectorCommand } from './i-connector-command';
import { ConnectorContext } from '../connector-context';
import { AutoMessageViewDataType } from '@autochrome/core/messaging/i-auto-message';

export abstract class BaseConnectorCommand implements IConnectorCommand {
	public abstract invoke(parameters: string[]): Promise<void>;

	protected async send<T extends AutoMessageViewDataType, R extends any = void>(data: T, toClientId: string | null = null): Promise<R> {
		return await ConnectorContext.instance.messageManager.sendMessage(data, toClientId);
	}
}
