import { AutoActionName, AutoActionResult, AutoAnyAction } from './action-types';
import { Config } from '../config/config';
import { InterruptibleUtility } from '../../common/interruptible-utility';
import { Guid } from '../../common/guid';
import { AutoActionFactory } from './auto-action-factory';
import { cloneDeep } from 'lodash-es';
import {
	AutoValueSourceType,
	AutoValueTypeName, IAutoParameter,
	IAutoValue,
	IParameterLink, IQuerySelector,
	ParameterLinkTypeName,
	QuerySelectorWithPropertyLink, StringOrIQuerySelector
} from './i-interfaces';
import { Logger } from '@autochrome/core/common/logger';

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
		return true;
	}

	public getLastAction(): AutoAction {
		if (this.next == null) {
			return this;
		}
		return this.next.getLastAction();
	}

	protected async querySelector(selector: QuerySelectorWithPropertyLink, wait: boolean, silent: boolean = false): Promise<Element[]> {
		let elements: Element[];

		const querySelector = await this.preProcessQuerySelector(selector);
		const selectorString = await this.convertQuerySelectorToString(selector);

		try {
			if (wait) {
				await InterruptibleUtility.wait(
					`Getting elements: ${selectorString}`,
					() => {
						elements = this.invokeQuerySelector(querySelector);
						return elements.length > 0;
					},
					this.timeout,
					100);
			} else {
				Logger.instance.debug(`Getting elements: ${selectorString}`);
				elements = this.invokeQuerySelector(querySelector);
				if (elements.length === 0) {
					throw new Error(`Elements: ${selectorString} haven't been found.`);
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

	protected async convertQuerySelectorToString(querySelector: QuerySelectorWithPropertyLink): Promise<string> {
		const selector = await this.preProcessQuerySelector(querySelector);

		if (typeof selector === "string") {
			return selector;
		}
		return `${selector.selector}`+
			`${selector.innerText == null ? '' : ', innerText: ' + selector.innerText}` +
			`${selector.textContent == null ? '' : ', textContent: ' + selector.textContent}` +
			`${selector.child == null ? '' : ', child: (' + await this.convertQuerySelectorToString(selector.child) + ')'}` +
			`${selector.parent == null ? '' : ', child: (' + await this.convertQuerySelectorToString(selector.parent) + ')'}` +
			`${selector.all ? ', all' : ''}`;
	}

	protected async preProcessQuerySelector(selector: QuerySelectorWithPropertyLink): Promise<StringOrIQuerySelector> {
		let querySelector = this.replaceParameters(selector) as StringOrIQuerySelector;
		await this.replaceSelectorAutoValues(querySelector);
		return this.replaceParameterMacro(querySelector);
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

	protected replaceParameterMacro(selector: StringOrIQuerySelector): StringOrIQuerySelector {
		if (selector == null) {
			return selector;
		}

		if (typeof selector === 'object') {
			selector.selector = this.replaceParameterMacro(selector.selector) as string;
		}

		if (typeof selector === 'string') {
			let result;
			let watchDog = 0;
			while ((result = /\{parameter:(.*?)\}/g.exec(selector as string)) !== null) {
				const paramValue = this.getParameterValue(result[1]);
				selector = selector.replace(result[0], paramValue);
				if (watchDog++ > 1000) {
					throw new Error(`replaceParameterMacro watchDog > 1000`);
				}
			}
		}

		return selector;
	}

	protected async replaceSelectorAutoValues(selector: StringOrIQuerySelector): Promise<void> {
		if (selector == null || typeof selector !== 'object') {
			return;
		}

		selector.innerText = await this.replaceAutoValue(selector.innerText);
		selector.textContent = await this.replaceAutoValue(selector.textContent);
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

	protected invokeQuerySelector(selector: StringOrIQuerySelector, root: Element = document.documentElement): Element[] {
		if (typeof selector === "string") {
			return Array.from(root.querySelectorAll(selector));
		}

		const querySelector: IQuerySelector = selector;

		let elements: Element[] = [];

		// It also can be done through the XPath, check the following link if more complex selectors are required.
		// https://stackoverflow.com/questions/37098405/javascript-queryselector-find-div-by-innertext/37098508#37098508
		if (typeof selector.textContent === "string") {
			const allElements = Array.from(root.querySelectorAll(querySelector.selector));
			elements = (querySelector.all === true)
				? allElements.filter((element) => RegExp(selector.textContent).test(element.textContent))
				: [allElements.find((element) => RegExp(selector.textContent).test(element.textContent))].filter((e) => e != null);
		} else if (typeof selector.innerText === "string") {
			const allElements = Array.from(root.querySelectorAll(querySelector.selector));
			elements = (querySelector.all === true)
				? allElements.filter((element) => RegExp(selector.innerText).test((element as HTMLElement).innerText))
				: [allElements.find((element) => RegExp(selector.innerText).test((element as HTMLElement).innerText))]
					.filter((e) => e != null);
		} else {
			elements = (querySelector.all === true)
				? Array.from(root.querySelectorAll(querySelector.selector))
				: [root.querySelector(querySelector.selector)].filter((e) => e != null);
		}

		if (selector.child != null) {
			return elements.reduce((childElements, element) => {
				const result = this.invokeQuerySelector(selector.child, element);
				return childElements.concat(result);
			}, [] as Element[]);
		}

		if (selector.parent != null && elements.length > 0) {
			const parentLevel = selector.parentLevel || 0;

			let parent = elements[0].parentElement;
			for (let i = 0; i < parentLevel; i++) {
				parent = parent.parentElement;
			}

			return this.invokeQuerySelector(selector.parent, parent);
		}

		if (selector.iframe != null && elements.length > 0) {
			const iframeBody = (elements[0] as HTMLIFrameElement).contentDocument?.body;
			if (iframeBody != null) {
				return this.invokeQuerySelector(selector.iframe, iframeBody);
			}
		}

		return elements;
	}


}
