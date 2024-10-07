import { AutoAction } from './auto-action';
import { IAutoAction } from "./types/i-auto-action";
import { AutoActionName } from "./types/auto-action-name";
import { AutoActionResult } from "./types/auto-action-result";
import { IAutoActionEmpty } from './types/i-auto-action-empty';

export class AutoActionEmpty extends AutoAction implements IAutoActionEmpty {
	public name = AutoActionName.AutoActionEmpty;

	public static fromJson(jsonAction: IAutoActionEmpty): AutoActionEmpty {
		return new AutoActionEmpty(jsonAction);
	}

	protected constructor(jsonAction: IAutoActionEmpty) {
		super(jsonAction);
		if (jsonAction.name !== this.name) {
			throw new Error(`Wrong Action type, expected '${this.name}' but got ${jsonAction.name}`);
		}
	}

	public async invoke(): Promise<void> {
		this.result = AutoActionResult.Success;
	}

	public toJson(): IAutoAction {
		const basicJson = (super.toJson() as IAutoActionEmpty);
		return basicJson;
	}
}
