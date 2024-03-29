import { Logger } from '../../common/logger';
import { IAutoAction, AutoAction } from './auto-action';
import { AutoActionName, AutoActionResult } from './action-types';
import { IQuerySelector } from '../../common/query-selector-helper';

export enum AutoValueType {
	attribute = 'attribute',
	innerText = 'innerText',
	textContent = 'textContent',
	innerHTML = 'innerHTML',
}

export interface IAutoValue {
	selector: string | IQuerySelector;
	wait: boolean;
	type: AutoValueType;
	attributeName: string;
}

export interface IAutoActionSetValue extends IAutoAction {
	selector: string | IQuerySelector;
	wait: boolean;
	value: any | IAutoValue;
}

export class AutoActionSetValue extends AutoAction implements IAutoActionSetValue {
	public name = AutoActionName.AutoActionSetValue;
	public selector: string | IQuerySelector;
	public value: any;
	public wait: boolean;

	public static fromJson(jsonAction: IAutoActionSetValue): AutoActionSetValue {
		return new AutoActionSetValue(jsonAction);
	}

	protected constructor(jsonAction: IAutoActionSetValue) {
		super(jsonAction);
		if (jsonAction.name !== this.name) {
			throw new Error(`Wrong Action type, expected '${this.name}' but got ${jsonAction.name}`);
		}

		this.selector = jsonAction.selector;
		this.value = jsonAction.value || null;
		this.wait = jsonAction.wait || false;
	}

	public async invoke(): Promise<void> {
		try {
			const elements: Element[] = await this.querySelector(this.selector, this.wait);

			const element = (elements as HTMLInputElement[])[0];

			element.value = await this.getValue();
			element.dispatchEvent(new Event('change', { 'bubbles': true, 'cancelable': true }));

			this.result = AutoActionResult.Success;
		} catch (error) {
			Logger.instance.error('Error: ', error);
			throw error;
		}
	}

	public toJson(): IAutoAction {
		const basicJson = (super.toJson() as IAutoActionSetValue);
		basicJson.selector = this.selector;
		basicJson.value = this.value;
		basicJson.wait = this.wait;
		return basicJson;
	}

	private async getValue(): Promise<any> {
		if (this.value == null) {
			return this.value;
		}

		if (this.value.type != null && this.value.selector != null) {
			const elements: Element[] = await this.querySelector(this.value.selector, this.value.wait === true);
			if (elements.length === 0) {
				return null;
			}
			const element = elements[0] as HTMLElement;
			switch (this.value.type) {
				case AutoValueType.attribute:
					return element.getAttribute(this.value.attributeName);
				case AutoValueType.innerHTML:
					return element.innerHTML;
				case AutoValueType.innerText:
					return element.innerText;
				case AutoValueType.textContent:
					return element.textContent;
				default:
					console.error(`Unknown AutoValueType ${this.value.type} fallback to innerText`);
					return element.innerText;
			}
		}

		return this.value;
	}
}
