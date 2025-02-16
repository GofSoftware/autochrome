import { IMessageProcessor } from '@autochrome/core/messaging/i-message-processor';
import {
    AutoMessageType, AutoMessageViewDataType,
    IAutoMessage, IAutoMessageViewDataSeveralContainersUpdate,
    IAutoMessageViewDataGlobalSettings, IAutoMessageViewDataLog,
    IAutoMessageViewDataProgramListUpdate, IAutoMessageViewDataBrowserTabList
} from '@autochrome/core/messaging/i-auto-message';
import { IPopupDataStream } from '../i-popup-data-stream';

export class PopupMessageProcessor<T extends AutoMessageViewDataType> implements IMessageProcessor {
	public static create<Y extends AutoMessageViewDataType>(popupDataStream: IPopupDataStream): PopupMessageProcessor<Y> {
		return new PopupMessageProcessor(popupDataStream);
	}

	private constructor(private popupDataStream: IPopupDataStream) {
	}

	public async process(message: IAutoMessage<T>): Promise<any> {
		switch (message.data.type) {
			case AutoMessageType.CompleteProgramListUpdate:
				this.popupDataStream.$programItems.next((message.data as IAutoMessageViewDataProgramListUpdate)!.programContainers);
				break;
			case AutoMessageType.SeveralContainersUpdate:
				this.popupDataStream.$programItemsUpdate.next((message.data! as IAutoMessageViewDataSeveralContainersUpdate).containerInfos);
				break;
			case AutoMessageType.GlobalSettings:
				this.popupDataStream.$globalSettings.next((message.data! as IAutoMessageViewDataGlobalSettings).globalSettings);
				break;
			case AutoMessageType.Log:
				this.popupDataStream.$log.next(message.data! as IAutoMessageViewDataLog);
				break;
			case AutoMessageType.BrowserTabList:
				this.popupDataStream.$browserTabs.next((message.data! as IAutoMessageViewDataBrowserTabList).browserTabs);
				break;
			default:
				throw(`MessageManager.processMessage Error: Unknown autoMessage type ${message.data.type}`);
		}
	}
}
