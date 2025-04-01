import {
	AutoMessageContentDataType,
	AutoMessageType, IAutoMessageContentDataAwake,
	IAutoMessageContentDataProgramAction,
	IAutoMessageContentDataProgramActionResult,
	IAutoMessageContentDataProgramInterrupt
} from '@autochrome/core/messaging/i-auto-message';
import { BehaviorSubject, filter, Observable } from 'rxjs';
import { AutoActionResult } from '@autochrome/core/program/actions/types/auto-action-result';
import { MessageManager } from '@autochrome/core/messaging/message-manager';
import { ContentToBackgroundMessageProcessor } from './content-to-background-message-processor';
import { ContentToBackgroundMessageTransporter } from './content-to-background-message.transporter';
import { Logger } from '@autochrome/core/common/logger';
import { EventDisposable } from '@autochrome/core/common/event-disposable';

export class ContentAutoLinkFacade extends EventDisposable {
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

	private connected: boolean = false;

	public init(): void {
		this.messageManager = MessageManager.create<AutoMessageContentDataType>(
			ContentToBackgroundMessageProcessor.create(this.$programRequest, this.$interruptRequest),
			ContentToBackgroundMessageTransporter.create<AutoMessageContentDataType>(false)
		);
		this.unsubscribeAndRegisterNamed(
			this.messageManager.transporter.connected$.pipe(
				filter((connected: boolean | null) => {
					return connected != null;
				})
			).subscribe((connected: boolean | null) => {
				this.connected = connected === true;
				Logger.instance.log(`Set connection state: ${this.connected} (${connected})`);
			}),
			'messageManager.transporter.connected$'
		);
		setInterval(() => {
			if (!this.connected) {
				Logger.instance.log('Content is not connected, trying to reconnect.');
				(this.messageManager?.transporter as ContentToBackgroundMessageTransporter).connect();
			}
		}, 2000);
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
