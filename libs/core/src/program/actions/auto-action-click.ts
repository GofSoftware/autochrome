import { Logger } from '../../common/logger';
import { AutoAction } from './auto-action';
import { Cursor } from '../../common/cursor';
import { QuerySelectorWithPropertyLink } from './types/i-interfaces';
import { IAutoAction } from './types/i-auto-action';
import { AutoActionName } from './types/auto-action-name';
import { AutoActionResult } from './types/auto-action-result';
import { AutoActionClickType, IAutoActionClick } from './types/i-auto-action-click';

export class AutoActionClick extends AutoAction implements IAutoActionClick {
	public name = AutoActionName.AutoActionClick;
	public selector: QuerySelectorWithPropertyLink;
	public smoothMouse: boolean;
	public wait: boolean;
	public clickType: AutoActionClickType;

	public static fromJson(jsonAction: IAutoActionClick): AutoActionClick {
		return new AutoActionClick(jsonAction);
	}

	protected constructor(jsonAction: IAutoActionClick) {
		super(jsonAction);
		if (jsonAction.name !== this.name) {
			throw new Error(`Wrong Action type, expected '${this.name}' but got ${jsonAction.name}`);
		}
		this.selector = jsonAction.selector;
		this.smoothMouse = jsonAction.smoothMouse ?? false;
		this.wait = jsonAction.wait ?? false;
		this.clickType = jsonAction.clickType ?? AutoActionClickType.MouseDownFocusMouseUp;
	}

	public async invoke(): Promise<void> {
		const elements: Element[] = await this.querySelector(this.selector, this.wait, false);

		for(const element of elements) {
			await this.clickOn(element as HTMLElement, this.smoothMouse);
		}

		this.result = AutoActionResult.Success;
	}

	public toJson(): IAutoAction {
		const basicJson = (super.toJson() as IAutoActionClick);
		basicJson.selector = this.selector;
		basicJson.smoothMouse = this.smoothMouse;
		basicJson.wait = this.wait;
		basicJson.clickType = this.clickType;
		return basicJson;
	}

	private async clickOn(element: HTMLElement, smoothMouse = false): Promise<void> {
		const box = element.getBoundingClientRect();
		if (box != null) {
			Logger.instance.debug(`Robot ClickOn [${
				await this.convertQuerySelectorToString(this.selector)
			}], box: `, box);

			const coordinateX = box.left + (box.right - box.left) / 2;
			const coordinateY = box.top + (box.bottom - box.top) / 2;

			await Cursor.moveTo(coordinateX, coordinateY, smoothMouse);

			switch (this.clickType) {
				case AutoActionClickType.Click:
					element.click();
					break;
				default:
					this.simulateMouseEvent(element, 'mousedown', coordinateX, coordinateY);
					if (element.focus != null) {
						element.focus();
					}
					this.simulateMouseEvent(element, 'mouseup', coordinateX, coordinateY);
					this.simulatePointerEvent(element);
			}
		} else {
			throw new Error(`Robot ClickOn [${this.selector}], box is undetermined...`);
		}
	}

	private simulatePointerEvent(element: Element) {
		element.dispatchEvent(new PointerEvent('click', {button: 0}));
	}

	private simulateMouseEvent(element: Element, eventName: string, coordinateX: number, coordinateY: number) {
		element.dispatchEvent(new MouseEvent(eventName, {
			view: window,
			bubbles: true,
			cancelable: true,
			clientX: coordinateX,
			clientY: coordinateY,
			button: 0,
			relatedTarget: element
		}));
	}
}
