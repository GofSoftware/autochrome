import { MessageManager } from '@autochrome/core/messaging/message-manager';
import { AutoMessageViewDataType, IBrowserTab } from '@autochrome/core/messaging/i-auto-message';
import { IProgramContainerInfo } from '@autochrome/core/program/container/i-program-container';

export class ConnectorContext {
	private static connectorContextInstance: ConnectorContext;
	public static get instance(): ConnectorContext {
		return ConnectorContext.connectorContextInstance || (ConnectorContext.connectorContextInstance = new ConnectorContext());
	}

	public messageManager: MessageManager<AutoMessageViewDataType>;
	public programInfos: IProgramContainerInfo[] = [];
	public browserTabs: IBrowserTab[] = [];
	public programs: string[] = [];
	public currentTab: IBrowserTab;
	public connected: boolean = false;
	public close: (code: number) => Promise<void>;
}
