import { Logger } from '../../common/logger';
import { AutoAction } from './auto-action';
import { IAutoAction } from "./types/i-auto-action";
import { AutoActionName } from "./types/auto-action-name";
import { AutoActionResult } from "./types/auto-action-result";
import { IAutoActionEnterText } from './types/i-auto-action-enter-text';

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
		this.text = jsonAction.text ?? '';
		this.wait = jsonAction.wait ?? false;
		this.focusBefore = jsonAction.focusBefore ?? false;
		this.blurAfter = jsonAction.blurAfter ?? false;
	}

	public async invoke(): Promise<void> {
		try {
			const elements: Element[] = await this.querySelector(this.selector, this.wait, false);

			const element: HTMLElement = elements[0] as HTMLElement;
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
