import { Logger } from '../../common/logger';
import { IAutoAction, AutoAction } from './auto-action';
import { AutoActionName, AutoActionResult } from './action-types';
import { IQuerySelector } from '../../common/query-selector-helper';

export interface IAutoActionCase extends IAutoAction {
	selector: string | IQuerySelector;
	wait?: boolean;
	thenActionId: string;
	elseActionId: string;
}

export class AutoActionCase extends AutoAction implements IAutoActionCase {
	public name = AutoActionName.AutoActionCase;
	public selector: string | IQuerySelector;
	public wait = false;
	public thenActionId: string;
	public elseActionId: string;

	public static fromJson(jsonAction: IAutoActionCase): AutoActionCase {
		return new AutoActionCase(jsonAction);
	}

	protected constructor(jsonAction: IAutoActionCase) {
		super(jsonAction);
		if (jsonAction.name !== this.name) {
			throw new Error(`Wrong Action type, expected '${this.name}' but got ${jsonAction.name}`);
		}
		this.selector = jsonAction.selector;
		this.wait = jsonAction.wait;
		this.thenActionId = jsonAction.thenActionId;
		this.elseActionId = jsonAction.elseActionId;
	}

	public async invoke(): Promise<void> {
		try {
			const elements: Element[] = await this.querySelector(this.selector, this.wait, true);

			if (elements.length > 0) {
				this.resultValue = this.thenActionId;
			} else {
				this.resultValue = this.elseActionId;
			}

			this.result = AutoActionResult.Success;
		} catch (error) {
			Logger.instance.error(`${this.name} error: `, error);
			throw error;
		}
	}

	public toJson(): IAutoAction {
		const basicJson = (super.toJson() as IAutoActionCase);
		basicJson.selector = this.selector;
		basicJson.wait = this.wait;
		basicJson.thenActionId = this.thenActionId;
		basicJson.elseActionId = this.elseActionId;
		return basicJson;
	}
}
