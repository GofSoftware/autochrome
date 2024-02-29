import { AutoActionName, AutoActionResult, AutoAnyAction } from './action-types';
import { Config } from '../config/config';
import { InterruptibleUtility } from '../../common/interruptible-utility';
import { IQuerySelector, QuerySelectorHelper } from '../../common/query-selector-helper';
import { Guid } from '../../common/guid';
import { AutoActionFactory } from './auto-action-factory';
import { cloneDeep } from 'lodash-es';

export const ParameterLinkTypeName = 'ParameterLink';

export type ParameterLinkType = 'ParameterLink';

export interface IParameterLink {
	type: ParameterLinkType;
	name: string;
}

export type IAutoParameterValue = string | number | boolean | IQuerySelector;

export interface IAutoParameter {
	name: string;
	value: IAutoParameterValue;
}

export type AnyQuerySelector = string | IQuerySelector;
export type QuerySelectorWithPropertyLink = AnyQuerySelector | IParameterLink;

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

		const querySelector = this.processParameterLink(selector as IParameterLink) as AnyQuerySelector;

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
					throw new Error(`Element: ${QuerySelectorHelper.convertToString(querySelector)} is not found.`);
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

	protected processParameterLink(parameterLink: IParameterLink): any {
		if (typeof parameterLink === 'object' && (parameterLink as IParameterLink)?.type === ParameterLinkTypeName) {
			const linkedParameter = this.parameters.find((parameter) => parameter.name === (parameterLink as IParameterLink).name);
			if(linkedParameter == null) {
				throw new Error(`Cannot find the parameter with the name ${(parameterLink as IParameterLink).name}`);
			}
			return linkedParameter.value;
		}

		return parameterLink;
	}
}
