import {
	IAutoMessage,
	AutoMessageType, IAutoMessageContentData, IAutoMessageContentDataProgramActionResult, AutoMessageContentDataType
} from '@autochrome/core/messaging/i-auto-message';
import { Logger } from '@autochrome/core/common/logger';
import { Robot } from '../../robot/robot';
import { BackgroundMessagingContext } from '../background-messaging.context';

export class RobotMessageProcessor<T extends AutoMessageContentDataType> {
	public static create<U extends AutoMessageContentDataType>(context: BackgroundMessagingContext): RobotMessageProcessor<U> {
		return new RobotMessageProcessor(context)
	}

	constructor(private context: BackgroundMessagingContext) {
	}

	public async processMessage(message: IAutoMessage<T>): Promise<any> {
		switch (message?.data.type) {
			case AutoMessageType.Ping:
				return;
			case AutoMessageType.ContentAwake:
			case AutoMessageType.ContentProgramActionResult:
				return await this.processContentMessage(message);
			default:
				return;
		}
	}

	private async processContentMessage(message: IAutoMessage<T>): Promise<boolean> {
		try {
			switch (message?.data.type) {
				case AutoMessageType.ContentAwake:
					await Robot.instance.continueProgramForTab((message.data! as IAutoMessageContentData).tabId!);
					return true;
				case AutoMessageType.ContentProgramActionResult:
					const data = message.data! as IAutoMessageContentDataProgramActionResult;
					await Robot.instance.processActionResult(data.tabId!, data);
					return true;
				default:
					return false;
			}
		} catch (error) {
			Logger.instance.error('processContentMessage Error.', error);
            return false;
		}
	}
}
