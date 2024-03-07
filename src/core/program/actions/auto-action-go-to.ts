import { Logger } from '../../common/logger';
import { IAutoAction, AutoAction, QuerySelectorWithPropertyLink } from './auto-action';
import { AutoActionName, AutoActionResult } from './action-types';

export interface IAutoActionGoTo extends IAutoAction {
	goToActionId: string;
}

export class AutoActionGoTo extends AutoAction implements IAutoActionGoTo {
	public name = AutoActionName.AutoActionGoTo;
	public goToActionId: string;

	public static fromJson(jsonAction: IAutoActionGoTo): AutoActionGoTo {
		return new AutoActionGoTo(jsonAction);
	}

	protected constructor(jsonAction: IAutoActionGoTo) {
		super(jsonAction);
		if (jsonAction.name !== this.name) {
			throw new Error(`Wrong Action type, expected '${this.name}' but got ${jsonAction.name}`);
		}
		this.goToActionId = jsonAction.goToActionId;
	}

	public async invoke(): Promise<void> {
		try {
			this.resultValue = this.goToActionId;

			this.result = AutoActionResult.Success;
		} catch (error) {
			Logger.instance.error(`${this.name} error: `, error);
			throw error;
		}
	}

	public toJson(): IAutoAction {
		const basicJson = (super.toJson() as IAutoActionGoTo);
		basicJson.goToActionId = this.goToActionId;
		return basicJson;
	}
}
