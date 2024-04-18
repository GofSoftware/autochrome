import { AutoActionName, AutoActionResult, AutoAnyAction } from './action-types';
import { Config } from '../config/config';
import { InterruptibleUtility } from '../../common/interruptible-utility';
import { QuerySelectorHelper } from '../../common/query-selector-helper';
import { Guid } from '../../common/guid';
import { AutoActionFactory } from './auto-action-factory';
import { cloneDeep } from 'lodash-es';
import {
	AutoValueSourceType,
	AutoValueTypeName, IAutoParameter,
	IAutoValue,
	IParameterLink,
	ParameterLinkTypeName,
	QuerySelectorWithPropertyLink, StringOrIQuerySelector
} from './i-interfaces';


/**
 * The base interface for all actions, includes fields that can be set in any nested action.
 * @id string is not required and will be set automatically when a Program is loaded. You only have to set the id if you are planing to
 * change the program flow and go directly to the action.
 */
export interface IAutoAction {
	id?: string; // A little help to a user, do not generate id if it is not really necessary (not a goto action for example)
	name: AutoActionName;
	description?: string;
	continueAfterFail?: boolean;
	timeout?: number;
	children?: IAutoAction[];
	parameters?: IAutoParameter[];
}

export abstract class AutoAction implements IAutoAction {
	public id: string;
	public index: number;
	public name: AutoActionName;
	public description: string;
	public previous: AutoAnyAction = null;
	public next: AutoAnyAction = null;
	public result: AutoActionResult = AutoActionResult.Failed;
	public resultValue: any = null;
	public continueAfterFail: boolean;
	public timeout: number;
	public children: AutoAction[];
	public parameters: IAutoParameter[];

	protected static idSet: Set<string> = new Set();
	protected static prop<T = any>(value: T, defaultValue: T): T {
		return value == null ? defaultValue : value;
	}

	protected constructor(jsonAction: IAutoAction) {
		if (AutoAction.idSet.has(jsonAction.id)) {
			throw new Error(`Not unique id: ${jsonAction.id}`);
		}

		this.id = jsonAction.id || Guid.v4();
		this.index = AutoActionFactory.instance.nextIndex();
		this.description = jsonAction.description;
		this.continueAfterFail = AutoAction.prop(jsonAction.continueAfterFail, false);
		this.timeout = AutoAction.prop(jsonAction.timeout, Config.instance.globalTimeout);

		let prevAction: AutoAction = this;
		this.children = (jsonAction.children || []).map((c) => {
			const nextAction = AutoActionFactory.instance.fromJson(c);
			const lastAction = this.selfOrLastChild(prevAction);
			lastAction.next = nextAction;
			nextAction.previous = lastAction;
			prevAction = nextAction;
			return nextAction;
		});

		this.parameters = cloneDeep((jsonAction.parameters || []))
	}

	public toString(): string {
		return `${this.id ? `[Id: ${this.id}] ` : ''}[${this.name}] ${this.description ? this.description : ''}`;
	}

	public toJson(): IAutoAction {
		return {
			id: this.id,
			name: this.name,
			description: this.description,
			continueAfterFail: this.continueAfterFail,
			timeout: this.timeout,
			children: (Array.isArray(this.children) ? this.children.map((c) => c.toJson()) : null),
			parameters: cloneDeep(this.parameters)
		};
	}

	public abstract invoke(): Promise<void>;

	public traverse(callback: (action: AutoAction) => boolean): boolean {
		let res = callback(this);
		if (res === false) {
			return false;
		}
		for (const child of this.children) {
			res = child.traverse(callback);
			if (res === false) {
				return false;
			}
		}
	}

	public getLastAction(): AutoAction {
		if (this.next == null) {
			return this;
		}
		return this.next.getLastAction();
	}

	protected async querySelector(selector: QuerySelectorWithPropertyLink, wait: boolean, silent: boolean = false): Promise<Element[]> {
		let elements: Element[];

		const querySelector = this.replaceParameters(selector) as StringOrIQuerySelector;
		await this.replaceSelectorAutoValues(querySelector);

		try {
			if (wait) {
				await InterruptibleUtility.wait(
					`Getting element: ${QuerySelectorHelper.convertToString(querySelector)}`,
					() => {
						elements = QuerySelectorHelper.querySelector(querySelector);
						return elements.length > 0;
					},
					this.timeout,
					100);
			} else {
				elements = QuerySelectorHelper.querySelector(querySelector);
				if (elements.length === 0) {
					throw new Error(`Element: ${QuerySelectorHelper.convertToString(querySelector)} has not been found.`);
				}
			}
		} catch (error) {
			if (silent) {
				return [];
			} else {
				throw error;
			}
		}
		return elements;
	}

	protected selfOrLastChild(autoAction: AutoAction): AutoAction {
		if (!Array.isArray(autoAction.children) || autoAction.children.length === 0) {
			return autoAction;
		}
		return autoAction.children[autoAction.children.length - 1];
	}

	protected replaceParameters(value: any): any {
		if (value == null || typeof value !== 'object') {
			return value;
		}

		if ((value as IParameterLink)?.type === ParameterLinkTypeName) {
			return this.getParameterValue((value as IParameterLink).name);
		}

		Object.keys(value).forEach((key: string) => {
			value[key] = this.replaceParameters(value[key]);
		});

		return value;
	}

	protected async replaceSelectorAutoValues(selector: StringOrIQuerySelector): Promise<void> {
		if (selector == null || typeof selector !== 'object') {
			return;
		}

		if(selector.innerText != null ||
			typeof selector.innerText === 'object' ||
			(selector.innerText as unknown as IAutoValue).type === AutoValueTypeName) {
			selector.innerText = await this.replaceAutoValue(selector.innerText);
		}
	}

	protected async replaceAutoValue(value: any): Promise<any> {
		if (value == null || typeof value !== 'object' || (value as IAutoValue).type !== AutoValueTypeName) {
			return value;
		}

		const autoValue = (value as IAutoValue);

		if (autoValue.selector == null) {
			throw new Error(`Auto Value must have a selector. Value: ${JSON.stringify(autoValue.selector)}`);
		}
		const elements: Element[] = await this.querySelector(autoValue.selector, autoValue.wait === true);
		if (elements.length === 0) {
			return null;
		}
		const element = elements[0] as HTMLElement;
		switch (autoValue.valueType) {
			case AutoValueSourceType.attribute:
				return element.getAttribute(autoValue.attributeName);
			case AutoValueSourceType.innerHTML:
				return element.innerHTML;
			case AutoValueSourceType.innerText:
				return element.innerText;
			case AutoValueSourceType.textContent:
				return element.textContent;
			default:
				throw new Error(`Unknown AutoValueType ${autoValue.type}. Value: ${JSON.stringify(autoValue.selector)}`);
		}
	}

	protected getParameterValue(name: string): any {
		const linkedParameter = this.parameters.find((parameter) => parameter.name === name);
		if(linkedParameter == null) {
			throw new Error(`Cannot find the parameter with the name ${name}`);
		}
		return linkedParameter.value;
	}
}
