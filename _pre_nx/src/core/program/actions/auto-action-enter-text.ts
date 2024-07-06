import { Logger } from '../../common/logger';
import { IAutoAction, AutoAction } from './auto-action';
import { AutoActionName, AutoActionResult } from './action-types';
import { InterruptibleUtility } from '../../common/interruptible-utility';
import { QuerySelectorHelper } from '../../common/query-selector-helper';

export interface IAutoActionEnterText extends IAutoAction {
	selector: string;
	text: string;
	wait?: boolean;
	focusBefore?: boolean;
	blurAfter?: boolean;
}

export class AutoActionEnterText extends AutoAction implements IAutoActionEnterText {
	public name = AutoActionName.AutoActionEnterText;
	public selector: string;
	public text: string;
	public wait: boolean;
	public focusBefore: boolean;
	public blurAfter: boolean;

	public static fromJson(jsonAction: IAutoActionEnterText): AutoActionEnterText {
		return new AutoActionEnterText(jsonAction);
	}

	protected constructor(jsonAction: IAutoActionEnterText) {
		super(jsonAction);
		if (jsonAction.name !== this.name) {
			throw new Error(`Wrong Action type, expected '${this.name}' but got ${jsonAction.name}`);
		}

		this.selector = jsonAction.selector;
		this.text = AutoAction.prop(jsonAction.text, '');
		this.wait = AutoAction.prop(jsonAction.wait, false);
		this.focusBefore = AutoAction.prop(jsonAction.focusBefore, false);
		this.blurAfter = AutoAction.prop(jsonAction.blurAfter, false);
	}

	public async invoke(): Promise<void> {
		try {
			let elements: Element[];
			if (this.wait) {
				await InterruptibleUtility.wait(
					`Getting element: ${this.selector}`,
					() => {
						elements = QuerySelectorHelper.querySelector(this.selector);
						return elements.length > 0;
					},
					this.timeout,
					100);
			} else {
				elements = QuerySelectorHelper.querySelector(this.selector);
				if (elements.length === 0) {
					throw new Error(`Element: ${ QuerySelectorHelper.convertToString(this.selector)} has not been found.`);
				}
			}
			const element: HTMLElement =  elements[0] as HTMLElement;
			if (this.focusBefore) {
				element.focus();
			}
			for (let i = 0; i < this.text.length; i++) {
				(element as HTMLInputElement).value += this.text[i];
			 	this.simulateCharacterEvent(element, 'keydown', this.text[i]);
			 	this.simulateCharacterEvent(element, 'keypress', this.text[i]);
				element.dispatchEvent(new Event('input', { 'bubbles': true, 'cancelable': true }));
			 	this.simulateCharacterEvent(element, 'keyup', this.text[i]);
			}
			if (this.blurAfter) {
				element.blur();
			}
			this.result = AutoActionResult.Success;
		} catch (error) {
			Logger.instance.error('Error: ', error);
			throw error;
		}
	}

	public toJson(): IAutoAction {
		const basicJson = (super.toJson() as IAutoActionEnterText);
		basicJson.selector = this.selector;
		basicJson.text = this.text;
		basicJson.wait = this.wait;
		basicJson.focusBefore = this.focusBefore;
		basicJson.blurAfter = this.blurAfter;
		return basicJson;
	}

	private simulateCharacterEvent(element: Element, eventName: string, character: string) {
		element.dispatchEvent(new KeyboardEvent(eventName, {
			view: window,
			key: character
		}));
	}
}
