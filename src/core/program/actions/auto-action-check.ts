import { IAutoAction, AutoAction } from './auto-action';
import { AutoActionName, AutoActionResult } from './action-types';
import { QuerySelectorHelper } from '../../common/query-selector-helper';
import { QuerySelectorWithPropertyLink } from './i-interfaces';

export enum IAutoActionCheckType {
	Exists = 'Exists',
	NotExists = 'NotExists'
}

export interface IAutoActionCheck extends IAutoAction {
	selector: QuerySelectorWithPropertyLink;
	wait?: boolean;
	type: IAutoActionCheckType;
	silent?: boolean;
	highlight?: boolean;
}

export class AutoActionCheck extends AutoAction implements IAutoActionCheck {
	public name = AutoActionName.AutoActionCheck;
	public type: IAutoActionCheckType;
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
		this.wait = jsonAction.wait;
		this.silent = AutoAction.prop(jsonAction.silent, false);
		this.highlight = AutoAction.prop(jsonAction.highlight, false);
	}

	public async invoke(): Promise<void> {
		const elements: Element[] = await this.querySelector(this.selector, this.wait, true);
		this.highlightElements(elements);

		switch (this.type) {
			case IAutoActionCheckType.Exists:
				this.result = elements.length > 0 ? AutoActionResult.Success : AutoActionResult.Failed;
				break;
			case IAutoActionCheckType.NotExists:
				this.result =  elements.length === 0 ? AutoActionResult.Success : AutoActionResult.Failed;
				break;
			default:
				this.result = AutoActionResult.Failed;
				throw new Error(`Unknown AutoActionCheck type: ${this.type}`);
		}
		if (this.result !== AutoActionResult.Success && this.silent === false) {
			throw new Error(`${this.name}: Check by the selector ${
				QuerySelectorHelper.convertToString(this.replaceParameters(this.selector))
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
