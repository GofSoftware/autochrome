import { Logger } from '../../common/logger';
import { IAutoAction, AutoAction } from './auto-action';
import { AutoActionName, AutoActionResult } from './action-types';
import { InterruptibleUtility } from '../../common/interruptible-utility';

export interface IAutoActionWait extends IAutoAction {
	timeToWait: number;
}

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
