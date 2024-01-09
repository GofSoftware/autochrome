import { AutoLinkContent } from '../../core/auto-link/auto-link-content';
import {
	IAutoMessageDataContentProgramAction,
	IAutoMessageDataContentProgramInterrupt
} from '../../core/auto-link/messaging/i-auto-message';
import { Logger } from '../../core/common/logger';
import { AutoActionFactory } from '../../core/program/actions/auto-action-factory';
import { AutoActionResult } from '../../core/program/actions/action-types';
import { ErrorHelper } from '../../core/common/error-helper';
import { filter } from 'rxjs';
import { InterruptibleUtility } from '../../core/common/interruptible-utility';

export class AutoActionContentWorker {
	private static autoActionWorkerInstance: AutoActionContentWorker;
	public static instance(): AutoActionContentWorker {
		return AutoActionContentWorker.autoActionWorkerInstance ||
			(AutoActionContentWorker.autoActionWorkerInstance = new AutoActionContentWorker());
	}

	private constructor() {
	}

	private actionQueue: IAutoMessageDataContentProgramAction[] = [];
	private isInProgress: boolean;

	public async start(): Promise<void> {
		Logger.instance.prefix = 'Autochrome:content';
		AutoLinkContent.instance().init();
		AutoLinkContent.instance().containerChanges$
			.pipe(filter((action) => action != null))
			.subscribe((action: IAutoMessageDataContentProgramAction) => {
				this.actionQueue.push(action);
				if (!this.isInProgress) {
					this.processQueue();
				}
		});
		AutoLinkContent.instance().interruptRequest$
			.pipe(filter((request) => request != null))
			.subscribe((request: IAutoMessageDataContentProgramInterrupt) => {
				InterruptibleUtility.clearAll(request.reason);
		});
		await AutoLinkContent.instance().sendAwake();
	}

	private async processQueue(): Promise<void> {
		if (this.actionQueue.length === 0) {
			Logger.instance.debug('AutoActionWorker has nothing to process.');
			return;
		}
		this.isInProgress = true;
		const action = this.actionQueue.shift();
		try {
			const autoAction = AutoActionFactory.instance.fromJson(action.action);

			Logger.instance.log(`AutoActionWorker start processing. ${autoAction.toString()}`);

			await autoAction.invoke();

			await AutoLinkContent.instance().sendProgramActionResult(autoAction.id, autoAction.result, autoAction.resultValue);
		} catch (error) {
			const actionName = action?.action?.name;
			const actionId = action?.action?.id;
			const errorMessage =
				`${actionName == null ? '' : `${actionName} [id: ${actionId}] error:`} ${ErrorHelper.genericErrorToString(error)}`;
			Logger.instance.error(`AutoActionWorker processing error.`, errorMessage);
			await AutoLinkContent.instance().sendProgramActionResult(
				action.action.id, AutoActionResult.Failed, null, ErrorHelper.genericErrorToString(errorMessage)
			);
		} finally {
			if (this.actionQueue.length > 0) {
				this.processQueue().then(/*Do not await it*/);
			} else {
				Logger.instance.log(`AutoActionWorker processing is completed.`);
				this.isInProgress = false;
			}
		}
	}
}
