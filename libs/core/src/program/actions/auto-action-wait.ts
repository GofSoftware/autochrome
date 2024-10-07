import { Logger } from '../../common/logger';
import { AutoAction } from './auto-action';
import { InterruptibleUtility } from '../../common/interruptible-utility';
import { IAutoAction } from "./types/i-auto-action";
import { AutoActionName } from "./types/auto-action-name";
import { AutoActionResult } from "./types/auto-action-result";
import { IAutoActionWait } from './types/i-auto-action-wait';

export class AutoActionWait extends AutoAction implements IAutoActionWait {
	public name = AutoActionName.AutoActionWait;
	public timeToWait: number;

	public static fromJson(jsonAction: IAutoActionWait): AutoActionWait {
		return new AutoActionWait(jsonAction);
	}

	protected constructor(jsonAction: IAutoActionWait) {
		super(jsonAction);
		if (jsonAction.name !== this.name) {
			throw new Error(`Wrong Action type, expected '${this.name}' but got ${jsonAction.name}`);
		}

		this.timeToWait = jsonAction.timeToWait;
	}

	public async invoke(): Promise<void> {
		try {
			await InterruptibleUtility.justWait(this.timeToWait, 'AutoActionWait');
			this.result = AutoActionResult.Success;
		} catch (error) {
			Logger.instance.error('AutoActionWait error: ', error);
			throw error;
		}
	}

	public toJson(): IAutoAction {
		const basicJson = (super.toJson() as IAutoActionWait);
		basicJson.timeToWait = this.timeToWait;
		return basicJson;
	}
}
