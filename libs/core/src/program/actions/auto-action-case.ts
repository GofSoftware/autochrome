import { Logger } from '../../common/logger';
import { AutoAction } from './auto-action';
import { QuerySelectorWithPropertyLink } from './types/i-interfaces';
import { IAutoAction } from "./types/i-auto-action";
import { AutoActionName } from "./types/auto-action-name";
import { AutoActionResult } from "./types/auto-action-result";
import { IAutoActionCase } from "./types/i-auto-action-case";

export class AutoActionCase extends AutoAction implements IAutoActionCase {
	public name = AutoActionName.AutoActionCase;
	public selector: QuerySelectorWithPropertyLink;
	public wait: boolean = false;
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
		this.wait = jsonAction.wait ?? false;
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
