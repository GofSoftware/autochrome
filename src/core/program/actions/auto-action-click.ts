import { Logger } from '../../common/logger';
import { IAutoAction, AutoAction } from './auto-action';
import { Cursor } from '../../common/cursor';
import { AutoActionName, AutoActionResult } from './action-types';
import { IQuerySelector } from '../../common/query-selector-helper';

export interface IAutoActionClick extends IAutoAction {
	selector: string | IQuerySelector;
	smoothMouse?: boolean;
	wait?: boolean;
}

export class AutoActionClick extends AutoAction implements IAutoActionClick {
	public name = AutoActionName.AutoActionClick;
	public selector: string | IQuerySelector;
	public smoothMouse: boolean;
	public wait: boolean;

	public static fromJson(jsonAction: IAutoActionClick): AutoActionClick {
		return new AutoActionClick(jsonAction);
	}

	protected constructor(jsonAction: IAutoActionClick) {
		super(jsonAction);
		if (jsonAction.name !== this.name) {
			throw new Error(`Wrong Action type, expected '${this.name}' but got ${jsonAction.name}`);
		}
		this.selector = jsonAction.selector;
		this.smoothMouse = AutoAction.prop(jsonAction.smoothMouse, false);
		this.wait = AutoAction.prop(jsonAction.wait, false);
	}

	public async invoke(): Promise<void> {
		const elements: Element[] = await this.querySelector(this.selector, this.wait, false);

		for(const element of elements) {
			await this.clickOn(element, this.smoothMouse);
		}

		this.result = AutoActionResult.Success;
	}

	public toJson(): IAutoAction {
		const basicJson = (super.toJson() as IAutoActionClick);
		basicJson.selector = this.selector;
		basicJson.smoothMouse = this.smoothMouse;
		basicJson.wait = this.wait;
		return basicJson;
	}

	private async clickOn(element: Element, smoothMouse: boolean = false): Promise<void> {
		const box = element.getBoundingClientRect();
		if (box != null) {
			Logger.instance.debug(`Robot ClickOn [${this.selector}], box: `, box);
			const coordX = box.left + (box.right - box.left) / 2;
			const coordY = box.top + (box.bottom - box.top) / 2;

			await Cursor.moveTo(coordX, coordY, smoothMouse);

			this.simulateMouseEvent(element, "mousedown", coordX, coordY);
			if((element as HTMLElement).focus != null) {
				(element as HTMLElement).focus();
			}
			this.simulateMouseEvent(element, "mouseup", coordX, coordY);
			this.simulatePointerEvent(element);
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
