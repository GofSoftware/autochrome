import { ContentAutoLinkFacade } from '../messaging/content-auto-link-facade';
import { IAutoMessageContentDataProgramAction } from '@autochrome/core/messaging/i-auto-message';
import { Logger } from '@autochrome/core/common/logger';
import { AutoActionFactory } from '@autochrome/core/program/actions/auto-action-factory';
import { AutoActionResult } from '@autochrome/core/program/actions/types/auto-action-result';
import { ErrorHelper } from '@autochrome/core/common/error-helper';
import { filter } from 'rxjs';
import { InterruptibleUtility } from '@autochrome/core/common/interruptible-utility';
import { LogSeverity } from '@autochrome/core/common/i-logger';

export class AutoActionContentWorker {
	private static autoActionWorkerInstance: AutoActionContentWorker;
	public static instance(): AutoActionContentWorker {
		return AutoActionContentWorker.autoActionWorkerInstance ||
			(AutoActionContentWorker.autoActionWorkerInstance = new AutoActionContentWorker());
	}

	private constructor() {
	}

	private actionQueue: IAutoMessageContentDataProgramAction[] = [];
	private isInProgress: boolean = false;

	public async start(): Promise<void> {
		Logger.instance.prefix = 'Autochrome:content';
		Logger.instance.severity = LogSeverity.debug;
		ContentAutoLinkFacade.instance().init();
		ContentAutoLinkFacade.instance().containerChanges$
			.pipe(filter((action) => action != null))
			.subscribe((action) => {
				this.actionQueue.push(action!);
				if (!this.isInProgress) {
					this.processQueue();
				}
		});
		ContentAutoLinkFacade.instance().interruptRequest$
			.pipe(filter((request) => request != null))
			.subscribe((request) => {
				InterruptibleUtility.clearAll(request!.reason);
		});
		await ContentAutoLinkFacade.instance().sendAwake();
	}

	private async processQueue(): Promise<void> {
		if (this.actionQueue.length === 0) {
			Logger.instance.debug('AutoActionWorker has nothing to process.');
			return;
		}
		this.isInProgress = true;
		const action = this.actionQueue.shift();
		if (action == null) {
			throw new Error(`There is no action to process.`);
		}
		try {
			AutoActionFactory.instance.skipProcedureInstantiation = true;
			const autoAction = AutoActionFactory.instance.fromJson(action.action);

			Logger.instance.log(`AutoActionWorker start processing. ${autoAction.toString()}`);

			await autoAction.invoke();

			await ContentAutoLinkFacade.instance().sendProgramActionResult(autoAction.id, autoAction.result, autoAction.resultValue);
		} catch (error) {
			const actionName = action?.action?.name;
			const actionId = action?.action?.id;
			const errorMessage =
				`${actionName == null ? '' : `${actionName} [id: ${actionId}] error:`} ${ErrorHelper.genericErrorToString(error)}`;
			Logger.instance.error(`AutoActionWorker processing error.`, errorMessage);
			await ContentAutoLinkFacade.instance().sendProgramActionResult(
				actionId ?? '', AutoActionResult.Failed, null, ErrorHelper.genericErrorToString(errorMessage)
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
