export const ParameterLinkTypeName = 'ParameterLink';
export type ParameterLinkType = 'ParameterLink';

export interface IParameterLink {
	type: ParameterLinkType;
	name: string;
}

export type IAutoParameterValue = string | number | boolean | IQuerySelectorWithParameters;

export interface IAutoParameter {
	name: string;
	value: IAutoParameterValue;
}

export type StringOrIQuerySelector = string | IQuerySelector;

export interface IQuerySelector {
	selector: string;
	innerText?: string;
	textContent?: string;
	all?: boolean;
	child?: StringOrIQuerySelector;
	parent?: StringOrIQuerySelector;
	iframe?: StringOrIQuerySelector;
	parentLevel?: number;
}

export interface IQuerySelectorWithParameters {
	selector: StringOrIQuerySelector | IParameterLink;
	innerText?: string | IParameterLink  | IAutoValue;
	textContent?: string | IParameterLink;
	all?: boolean | IParameterLink;
	child?: StringOrIQuerySelectorWithParameters;
	parent?: StringOrIQuerySelectorWithParameters;
	iframe?: StringOrIQuerySelectorWithParameters;
	parentLevel?: number | IParameterLink;
}

export type StringOrIQuerySelectorWithParameters = string | IQuerySelectorWithParameters;
export type QuerySelectorWithPropertyLink = StringOrIQuerySelectorWithParameters | IParameterLink;

export enum AutoValueSourceType {
	attribute = 'attribute',
	innerText = 'innerText',
	textContent = 'textContent',
	innerHTML = 'innerHTML'
}

export const AutoValueTypeName = 'AutoValue';
export type AutoValueType = 'AutoValue';

export interface IAutoValue {
	type: AutoValueType;
	selector: QuerySelectorWithPropertyLink;
	wait: boolean;
	valueType: AutoValueSourceType;
	attributeName: string;
}
