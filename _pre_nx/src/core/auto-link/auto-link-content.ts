import {
	IAutoMessage,
	IAutoMessageDataContentAwake,
	IAutoMessageDataContentProgramAction,
	IAutoMessageDataContentProgramActionResult,
	IAutoMessageDataContentProgramInterrupt,
	AutoMessageType
} from './messaging/i-auto-message';
import { BehaviorSubject, Observable } from 'rxjs';
import { Logger } from '../common/logger';
import { AutoActionResult } from '../program/actions/action-types';
import { Guid } from '../common/guid';
import { StringHelper } from '../common/string-helper';

export class AutoLinkContent {
	private static autoLinkContentInstance: AutoLinkContent;
	public static instance(): AutoLinkContent {
		return AutoLinkContent.autoLinkContentInstance || (AutoLinkContent.autoLinkContentInstance = new AutoLinkContent());
	}

	private instanceId: string = Guid.v4();

	private constructor() {
	}

	private programRequestSubject$ = new BehaviorSubject<IAutoMessageDataContentProgramAction>(null);
	public get containerChanges$(): Observable<IAutoMessageDataContentProgramAction> {
		return this.programRequestSubject$.asObservable();
	}

	private interruptRequestSubject$ = new BehaviorSubject<IAutoMessageDataContentProgramInterrupt>(null);
	public get interruptRequest$(): Observable<IAutoMessageDataContentProgramInterrupt> {
		return this.interruptRequestSubject$.asObservable();
	}

	public init(): void {
		Logger.instance.debug(`AutoLinkContent initialized with id: ${this.instanceId}`);
		((id: string) => {
			chrome.runtime.onMessage.addListener(
				(message: IAutoMessage, sender: chrome.runtime.MessageSender, sendResponse: (response: boolean) => void) => {

					Logger.instance.debug(`AutoLinkContent instanceId: ${id}`);
					Logger.instance.debug(`AutoLinkContent [id: ${StringHelper.squeezeGuid(id)}] got message`, message, sender);

					switch (message?.type) {
						case AutoMessageType.ContentProgramAction:
							sendResponse(true);
							this.programRequestSubject$.next(message.data as IAutoMessageDataContentProgramAction);
							break;
						case AutoMessageType.ContentProgramInterrupt:
							sendResponse(true);
							this.interruptRequestSubject$.next(message.data as IAutoMessageDataContentProgramInterrupt);
							break;
						default:
							sendResponse(false);
					}

					return false;
				}
			);
		})(this.instanceId);
	}

	public async sendAwake(): Promise<boolean> {
		const message: IAutoMessage<IAutoMessageDataContentAwake> = {type: AutoMessageType.ContentAwake, data: {now: Date.now()}};
		const result = await chrome.runtime.sendMessage(message);
		return result === true;
	}

	public async sendProgramActionResult(
		actionId: string, actionResult: AutoActionResult, actionResultValue: any, error?: string
	): Promise<boolean> {
		const message: IAutoMessage<IAutoMessageDataContentProgramActionResult> = {
			type: AutoMessageType.ContentProgramActionResult,
			data: {actionId, result: actionResult, resultValue: actionResultValue, error}
		};
		const result = await chrome.runtime.sendMessage(message);
		return result === true;
	}
}
