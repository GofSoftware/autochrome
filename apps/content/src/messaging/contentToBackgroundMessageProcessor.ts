import { IMessageProcessor } from '@autochrome/core/messaging/i-message-processor';
import {
	AutoMessageType,
	IAutoMessage,
	IAutoMessageContentData,
	IAutoMessageContentDataProgramAction,
	IAutoMessageContentDataProgramInterrupt
} from '@autochrome/core/messaging/i-auto-message';
import { BehaviorSubject } from 'rxjs';

export class ContentToBackgroundMessageProcessor<T extends IAutoMessage<IAutoMessageContentData> = IAutoMessage<IAutoMessageContentData>>
		implements IMessageProcessor {

	private static contentToBackgroundMessageProcessorInstance: ContentToBackgroundMessageProcessor;
	public static create(
		programRequestSubject$: BehaviorSubject<IAutoMessageContentDataProgramAction | null>,
		interruptRequestSubject$: BehaviorSubject<IAutoMessageContentDataProgramInterrupt | null>
	): ContentToBackgroundMessageProcessor {
		return ContentToBackgroundMessageProcessor.contentToBackgroundMessageProcessorInstance ||
			(ContentToBackgroundMessageProcessor.contentToBackgroundMessageProcessorInstance = new ContentToBackgroundMessageProcessor(
				programRequestSubject$, interruptRequestSubject$
			));
	}

	constructor(
		private programRequestSubject$: BehaviorSubject<IAutoMessageContentDataProgramAction | null>,
		private interruptRequestSubject$: BehaviorSubject<IAutoMessageContentDataProgramInterrupt | null>
	) {
	}

	public async process(message: T): Promise<any> {
		switch (message?.data?.type) {
			case AutoMessageType.ContentProgramAction:
				this.programRequestSubject$.next(message.data as IAutoMessageContentDataProgramAction);
				break;
			case AutoMessageType.ContentProgramInterrupt:
				this.interruptRequestSubject$.next(message.data as IAutoMessageContentDataProgramInterrupt);
				break;
		}
	}
}
