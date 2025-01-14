import { IMessageProcessor } from '@autochrome/core/messaging/i-message-processor';
import {
	AutoMessageType, AutoMessageViewDataType,
	IAutoMessage, IAutoMessageViewDataGlobalSettings,
	IAutoMessageViewDataLog, IAutoMessageViewDataProgramListUpdate, IAutoMessageViewDataSeveralContainersUpdate
} from '@autochrome/core/messaging/i-auto-message';
import { WebSocketLogMessageHandler } from './handlers/web-socket-Log-message.handler';
import { Logger } from '@autochrome/core/common/logger';
import { SeveralContainersUpdateHandler } from './handlers/several-containers-update.handler';

export class ConnectorMessageProcessor<T extends AutoMessageViewDataType> implements IMessageProcessor {
	public static create<T extends AutoMessageViewDataType>(): ConnectorMessageProcessor<T> {
		return new ConnectorMessageProcessor();
	}

	private severalContainersUpdateHandler = SeveralContainersUpdateHandler.create();

	public async process(message: IAutoMessage<T>): Promise<any> {
		switch (message.data.type) {
			case AutoMessageType.Log:
				await WebSocketLogMessageHandler.create().process(message as IAutoMessage<IAutoMessageViewDataLog>);
				break;
			case AutoMessageType.GlobalSettings:
				Logger.instance.log(
					'Got Global Settings: ',
					(message as IAutoMessage<IAutoMessageViewDataGlobalSettings>).data.globalSettings
				);
				break;
			case AutoMessageType.CompleteProgramListUpdate:
				Logger.instance.log(
					'Got Complete Program List Update: ',
					(message as IAutoMessage<IAutoMessageViewDataProgramListUpdate>).data.programContainers.map(c => c.id).join(', ')
				);
				break;
			case AutoMessageType.SeveralContainersUpdate:
				await this.severalContainersUpdateHandler.process(message as IAutoMessage<IAutoMessageViewDataSeveralContainersUpdate>);
				break;
			default:
				Logger.instance.warn(`MessageManager.processMessage Error: Unknown autoMessage type ${message.data.type}`);
		}
	}
}
