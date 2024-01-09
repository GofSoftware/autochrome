import { Logger } from '../../common/logger';
import { IAutoAction, AutoAction } from './auto-action';
import { AutoActionName, AutoActionResult } from './action-types';
import { InterruptibleUtility } from '../../common/interruptible-utility';
import { IQuerySelector, QuerySelectorHelper } from '../../common/query-selector-helper';

export enum AutoActionWaitUntilType {
	appear = 'appear',
	disappear = 'disappear'
}
export interface IAutoActionWaitUntil extends IAutoAction {
	untilType: AutoActionWaitUntilType;
	selector: IQuerySelector | string;
}

export class AutoActionWaitUntil extends AutoAction implements IAutoActionWaitUntil {
	public name = AutoActionName.AutoActionWaitUntil;
	public untilType: AutoActionWaitUntilType;
	public selector: IQuerySelector | string;

	public static fromJson(jsonAction: IAutoActionWaitUntil): AutoActionWaitUntil {
		return new AutoActionWaitUntil(jsonAction);
	}

	protected constructor(jsonAction: IAutoActionWaitUntil) {
		super(jsonAction);
		if (jsonAction.name !== this.name) {
			throw new Error(`Wrong Action type, expected '${this.name}' but got ${jsonAction.name}`);
		}

		this.untilType = jsonAction.untilType;
		this.selector = jsonAction.selector;
	}

	public async invoke(): Promise<void> {
		try {
			await InterruptibleUtility.wait(
				`Wait until ${QuerySelectorHelper.convertToString(this.selector)} ${this.untilType}`,
				() => {
					const elements = QuerySelectorHelper.querySelector(this.selector);
					if (this.untilType === AutoActionWaitUntilType.appear) {
						return elements.length > 0;
					}
					if (this.untilType === AutoActionWaitUntilType.disappear) {
						return elements.length === 0;
					}
					throw new Error(`AutoActionWaitUntil: unknown AutoActionWaitUntilType ${this.untilType}`);
				},
				this.timeout,
				100);

			this.result = AutoActionResult.Success;
		} catch (error) {
			Logger.instance.error('AutoActionWait error: ', error);
			throw error;
		}
	}

	public toJson(): IAutoAction {
		const basicJson = (super.toJson() as IAutoActionWaitUntil);
		basicJson.untilType = this.untilType;
		basicJson.selector = this.selector;
		return basicJson;
	}
}
