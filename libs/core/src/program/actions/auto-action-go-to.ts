import { Logger } from '../../common/logger';
import { AutoAction } from './auto-action';
import { IAutoAction } from "./types/i-auto-action";
import { AutoActionName } from "./types/auto-action-name";
import { AutoActionResult } from "./types/auto-action-result";
import { IAutoActionGoTo } from './types/i-auto-action-go-to';

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
