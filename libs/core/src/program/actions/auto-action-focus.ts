import { AutoAction } from './auto-action';
import { Cursor } from '../../common/cursor';
import { QuerySelectorWithPropertyLink } from './types/i-interfaces';
import { IAutoAction } from "./types/i-auto-action";
import { AutoActionName } from "./types/auto-action-name";
import { AutoActionResult } from "./types/auto-action-result";
import { IAutoActionFocus } from './types/i-auto-action-focus';

export class AutoActionFocus extends AutoAction implements IAutoActionFocus {
	public name = AutoActionName.AutoActionFocus;
	public selector: QuerySelectorWithPropertyLink;
	public smoothMouse: boolean;
	public wait: boolean;
	public blur: boolean;

	public static fromJson(jsonAction: IAutoActionFocus): AutoActionFocus {
		return new AutoActionFocus(jsonAction);
	}

	protected constructor(jsonAction: IAutoActionFocus) {
		super(jsonAction);
		if (jsonAction.name !== this.name) {
			throw new Error(`Wrong Action type, expected '${this.name}' but got ${jsonAction.name}`);
		}
		this.selector = jsonAction.selector;
		this.smoothMouse = jsonAction.smoothMouse ?? false;
		this.wait = jsonAction.wait ?? false;
		this.blur = jsonAction.blur ?? false;
	}

	public async invoke(): Promise<void> {
		const elements: Element[] = await this.querySelector(this.selector, this.wait, false);

		await this.moveCursorTo(elements[0]);

		if (this.blur) {
			(elements[0] as HTMLElement).blur();
		} else {
			(elements[0] as HTMLElement).focus();
		}

		this.result = AutoActionResult.Success;
	}

	public toJson(): IAutoAction {
		const basicJson = (super.toJson() as IAutoActionFocus);
		basicJson.selector = this.selector;
		basicJson.smoothMouse = this.smoothMouse;
		basicJson.wait = this.wait;
		basicJson.blur = this.blur;
		return basicJson;
	}

	private async moveCursorTo(element: Element): Promise<void> {
		const box = element.getBoundingClientRect();
		if (box != null) {
			const coordX = box.left + (box.right - box.left) / 2;
			const coordY = box.top + (box.bottom - box.top) / 2;

			await Cursor.moveTo(coordX, coordY, this.smoothMouse);
		}
	}
}
