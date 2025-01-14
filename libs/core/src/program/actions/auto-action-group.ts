import { AutoAction } from './auto-action';
import { IAutoAction } from "./types/i-auto-action";
import { AutoActionName } from "./types/auto-action-name";
import { AutoActionResult } from "./types/auto-action-result";
import { IAutoActionGroup } from './types/i-auto-action-group';

export class AutoActionGroup extends AutoAction implements IAutoActionGroup {
	public name = AutoActionName.AutoActionGroup;

	public static fromJson(jsonAction: IAutoActionGroup): AutoActionGroup {
		return new AutoActionGroup(jsonAction);
	}

	protected constructor(jsonAction: IAutoActionGroup) {
		super(jsonAction);
		if (jsonAction.name !== this.name) {
			throw new Error(`Wrong Action type, expected '${this.name}' but got ${jsonAction.name}`);
		}
	}

	public async invoke(): Promise<void> {
		this.result = AutoActionResult.Success;
	}

	public toJson(): IAutoAction {
		const basicJson = (super.toJson() as IAutoActionGroup);
		return basicJson;
	}
}
