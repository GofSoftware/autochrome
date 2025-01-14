import {
	AutoMessageContentDataType,
	AutoMessageType, IAutoMessageContentDataAwake,
	IAutoMessageContentDataProgramAction,
	IAutoMessageContentDataProgramActionResult,
	IAutoMessageContentDataProgramInterrupt
} from '@autochrome/core/messaging/i-auto-message';
import { BehaviorSubject, Observable } from 'rxjs';
import { AutoActionResult } from '@autochrome/core/program/actions/types/auto-action-result';
import { MessageManager } from '@autochrome/core/messaging/message-manager';
import { ContentToBackgroundMessageProcessor } from './contentToBackgroundMessageProcessor';
import { ContentToBackgroundMessageTransporter } from './content-to-background-message.transporter';

export class ContentAutoLinkFacade {
	private static autoLinkContentInstance: ContentAutoLinkFacade;
	public static instance(): ContentAutoLinkFacade {
		return ContentAutoLinkFacade.autoLinkContentInstance || (ContentAutoLinkFacade.autoLinkContentInstance = new ContentAutoLinkFacade());
	}

	private messageManager: MessageManager<AutoMessageContentDataType> | undefined;

	private $programRequest = new BehaviorSubject<IAutoMessageContentDataProgramAction | null>(null);
	public get containerChanges$(): Observable<IAutoMessageContentDataProgramAction | null> {
		return this.$programRequest.asObservable();
	}

	private $interruptRequest = new BehaviorSubject<IAutoMessageContentDataProgramInterrupt | null>(null);
	public get interruptRequest$(): Observable<IAutoMessageContentDataProgramInterrupt | null> {
		return this.$interruptRequest.asObservable();
	}

	public init(): void {
		this.messageManager = MessageManager.create<AutoMessageContentDataType>(
			ContentToBackgroundMessageProcessor.create(this.$programRequest, this.$interruptRequest),
			ContentToBackgroundMessageTransporter.create<AutoMessageContentDataType>()
		);
	}

	public async sendProgramActionResult(
		actionId: string, actionResult: AutoActionResult, actionResultValue: any, error?: string
	): Promise<void> {
		const data: IAutoMessageContentDataProgramActionResult = {
			type: AutoMessageType.ContentProgramActionResult,
			actionId,
			result: actionResult,
			resultValue: actionResultValue,
			error
		}
		await this.messageManager!.sendMessage(data, null);
	}

	public async sendAwake(): Promise<void> {
		const data: IAutoMessageContentDataAwake = {
			type: AutoMessageType.ContentAwake
		}
		await this.messageManager!.sendNoResponseMessage(data, null);
	}
}
