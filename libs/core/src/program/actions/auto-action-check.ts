import { AutoAction } from './auto-action';
import { QuerySelectorWithPropertyLink } from './types/i-interfaces';
import { IAutoAction } from "./types/i-auto-action";
import { AutoActionName } from "./types/auto-action-name";
import { AutoActionResult } from "./types/auto-action-result";
import { IAutoActionCheck, AutoActionCheckType } from "./types/i-auto-action-check";

export class AutoActionCheck extends AutoAction implements IAutoActionCheck {
	public name = AutoActionName.AutoActionCheck;
	public type: AutoActionCheckType;
	public selector: QuerySelectorWithPropertyLink;
	public wait?: boolean;
	public silent?: boolean;
	public highlight?: boolean;

	public static fromJson(jsonAction: IAutoActionCheck): AutoActionCheck {
		return new AutoActionCheck(jsonAction);
	}

	protected constructor(jsonAction: IAutoActionCheck) {
		super(jsonAction);
		if (jsonAction.name !== this.name) {
			throw new Error(`Wrong Action type, expected '${this.name}' but got ${jsonAction.name}`);
		}
		this.type = jsonAction.type;
		this.selector = jsonAction.selector;
		this.wait = jsonAction.wait ?? false;
		this.silent = jsonAction.silent ?? false;
		this.highlight = jsonAction.highlight ?? false;
	}

	public async invoke(): Promise<void> {
		const elements: Element[] = await this.querySelector(this.selector, this.wait ?? false, true);
		this.highlightElements(elements);

		switch (this.type) {
			case AutoActionCheckType.Exists:
				this.result = elements.length > 0 ? AutoActionResult.Success : AutoActionResult.Failed;
				break;
			case AutoActionCheckType.NotExists:
				this.result =  elements.length === 0 ? AutoActionResult.Success : AutoActionResult.Failed;
				break;
			default:
				this.result = AutoActionResult.Failed;
				throw new Error(`Unknown AutoActionCheck type: ${this.type}`);
		}
		if (this.result !== AutoActionResult.Success && this.silent === false) {
			throw new Error(`${this.name}: Check by the selector ${
				await this.convertQuerySelectorToString(this.selector)
			} is failed.`);
		}
	}

	public toJson(): IAutoAction {
		const basicJson = (super.toJson() as IAutoActionCheck);
		basicJson.type = this.type;
		basicJson.selector = this.selector;
		basicJson.wait = this.wait;
		basicJson.silent = this.silent;
		basicJson.highlight = this.highlight;
		return basicJson;
	}

	private highlightElements(elements: Element[]): void {
		if (this.highlight !== true || !Array.isArray(elements) || elements.length === 0) {
			return;
		}
		elements.forEach((element) => {
			(element as HTMLElement).style.backgroundColor = '#00FF00';
		});
	}
}
