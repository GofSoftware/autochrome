import { IAutoAction, AutoAction } from './auto-action';
import { AutoActionName, AutoActionResult } from './action-types';

enum AutoActionGetTextType {
	innerText = 'innerText',
	textContent = 'textContent'
}

export interface IAutoActionGetText extends IAutoAction {
	selector: string;
	textType: AutoActionGetTextType;
	wait?: boolean;
}

/**
 * For now this actions does nothing because the resultValue isn't processed on the server-side.
 * It is not really clear do we need something like this because we can take the value right in the action that is needed it.
 */
export class AutoActionGetText extends AutoAction implements IAutoActionGetText {
	public name = AutoActionName.AutoActionGetText;
	public selector: string;
	public textType: AutoActionGetTextType;
	public wait: boolean;

	public static fromJson(jsonAction: IAutoActionGetText): AutoActionGetText {
		return new AutoActionGetText(jsonAction);
	}

	protected constructor(jsonAction: IAutoActionGetText) {
		super(jsonAction);
		if (jsonAction.name !== this.name) {
			throw new Error(`Wrong Action type, expected '${this.name}' but got ${jsonAction.name}`);
		}
		this.selector = jsonAction.selector;
		this.textType = jsonAction.textType;
		this.wait = jsonAction.wait;
	}

	public async invoke(): Promise<void> {
		const elements: HTMLElement[] = await this.querySelector(this.selector, this.wait, false) as HTMLElement[];

		switch (this.textType) {
			case AutoActionGetTextType.innerText:
				this.resultValue = elements[0].innerText;
			break;
			case AutoActionGetTextType.textContent:
				this.resultValue = elements[0].textContent;
			break;
			default:
				throw new Error(`${this.name} error, the textType: ${this.textType} is not implemented.`);
		}

		this.result = AutoActionResult.Success;
	}

	public toJson(): IAutoAction {
		const basicJson = (super.toJson() as IAutoActionGetText);
		basicJson.selector = this.selector;
		basicJson.textType = this.textType;
		basicJson.wait = this.wait;
		return basicJson;
	}
}
