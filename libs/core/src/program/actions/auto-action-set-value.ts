import { Logger } from '../../common/logger';
import { AutoAction } from './auto-action';
import { IAutoValue, IParameterLink, QuerySelectorWithPropertyLink } from './types/i-interfaces';
import { IAutoAction } from './types/i-auto-action';
import { AutoActionName } from './types/auto-action-name';
import { AutoActionResult } from './types/auto-action-result';
import { IAutoActionSetValue } from './types/i-auto-action-set-value';
import { DomEventName } from './types/dom-event-name';

export class AutoActionSetValue extends AutoAction implements IAutoActionSetValue {
	public name = AutoActionName.AutoActionSetValue;
	public selector: QuerySelectorWithPropertyLink;
	public value: any | IAutoValue | IParameterLink;
	public events: DomEventName[] | undefined;
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
		this.events = jsonAction.events || [DomEventName.Change];
	}

	public async invoke(): Promise<void> {
		try {
			const elements: Element[] = await this.querySelector(this.selector, this.wait);

			const element = (elements as HTMLInputElement[])[0];

			element.value = await this.getValue();
			this.events?.forEach(event => {
				element.dispatchEvent(new Event(event, { 'bubbles': true, 'cancelable': true }));
			})

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
		basicJson.events = this.events?.slice();
		return basicJson;
	}

	private async getValue(): Promise<any> {
		const processedValue = this.replaceParameters(this.value);
		return await this.replaceAutoValue(processedValue);
	}
}
