import { IAutoAction, AutoAction } from './auto-action';
import { AutoActionName, AutoActionResult } from './action-types';

export interface IAutoActionEmpty extends IAutoAction {
}

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
