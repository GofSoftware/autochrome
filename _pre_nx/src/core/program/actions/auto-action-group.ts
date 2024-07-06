import { IAutoAction, AutoAction } from './auto-action';
import { AutoActionName, AutoActionResult } from './action-types';

export interface IAutoActionGroup extends IAutoAction {
}

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
