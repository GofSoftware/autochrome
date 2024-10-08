import { AutoAction } from './auto-action';
import { AutoActionCheck } from './auto-action-check';
import { IAutoAction } from './types/i-auto-action';
import { AutoActionName } from './types/auto-action-name';
import { AutoActionResult } from './types/auto-action-result';
import { IAutoActionCheckGroup } from './types/i-auto-action-check-group';
import { AutoActionGroupOperator } from './types/i-auto-action-check-group';
import { IAutoActionCheck } from './types/i-auto-action-check';

export class AutoActionCheckGroup extends AutoAction implements IAutoActionCheckGroup {
	public operator: AutoActionGroupOperator;
	public checkItems: (AutoActionCheckGroup | AutoActionCheck)[];
	public silent?: boolean;
	public name = AutoActionName.AutoActionCheckGroup;

	public static fromJson(jsonAction: IAutoActionCheckGroup): AutoActionCheckGroup {
		return new AutoActionCheckGroup(jsonAction);
	}

	protected constructor(jsonAction: IAutoActionCheckGroup) {
		super(jsonAction);
		if (jsonAction.name !== this.name) {
			throw new Error(`Wrong Action type, expected '${this.name}' but got ${jsonAction.name}`);
		}

		this.operator = jsonAction.operator;
		this.checkItems = (jsonAction.checkItems || []).map((checkAction) => {
			switch(checkAction.name) {
				case 'AutoActionCheckGroup':
					return AutoActionCheckGroup.fromJson(checkAction as IAutoActionCheckGroup);
				case 'AutoActionCheck':
					return AutoActionCheck.fromJson(checkAction as IAutoActionCheck);
				default:
					throw new Error(`The unsupported Check type ${checkAction.name}`);
			}
		});
		this.silent = jsonAction.silent ?? false;
	}

	public async invoke(): Promise<void> {
		await Promise.all(this.checkItems.map(async (item) => await item.invoke()));

		let res = false;
		switch (this.operator) {
			case AutoActionGroupOperator.And:
				res = this.checkItems.every((item) => item.result === AutoActionResult.Success);
				break;
			case AutoActionGroupOperator.Or:
				res = this.checkItems.some((item) => item.result === AutoActionResult.Success);
				break;
			default:
				throw new Error(`Unknown AutoActionCheckGroup operator: ${this.operator}`);
		}
		this.result = res ? AutoActionResult.Success : AutoActionResult.Failed;
		if (this.result !== AutoActionResult.Success && this.silent === false) {
			throw new Error(`IAutoActionCheckGroup ${this.name}: Check by the selector is failed.`);
		}
	}

	public toJson(): IAutoAction {
		const basicJson = (super.toJson() as IAutoActionCheckGroup);
		basicJson.operator = this.operator;
		basicJson.checkItems = this.checkItems.map((item) => item.toJson() as (IAutoActionCheckGroup | IAutoActionCheck));
		basicJson.silent = this.silent;
		return basicJson;
	}
}
