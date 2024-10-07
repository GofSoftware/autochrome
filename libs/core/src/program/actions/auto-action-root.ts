import { AutoAction } from './auto-action';
import { IAutoAction } from "./types/i-auto-action";
import { AutoActionName } from "./types/auto-action-name";
import { AutoActionResult } from "./types/auto-action-result";
import { IAutoActionRoot } from './types/i-auto-action-root';

export class AutoActionRoot extends AutoAction implements IAutoActionRoot {
	public name = AutoActionName.AutoActionRoot;

	public static fromJson(jsonAction: IAutoActionRoot): AutoActionRoot {
		return new AutoActionRoot(jsonAction);
	}

	protected constructor(jsonAction: IAutoActionRoot) {
		super(jsonAction);
		if (jsonAction.name !== this.name) {
			throw new Error(`Wrong Action type, expected '${this.name}' but got ${jsonAction.name}`);
		}
	}

	public async invoke(): Promise<void> {
		this.result = AutoActionResult.Success;
	}

	public toJson(): IAutoAction {
		const basicJson = (super.toJson() as IAutoActionRoot);
		return basicJson;
	}
}
