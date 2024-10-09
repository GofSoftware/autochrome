import { StringOrIQuerySelectorWithParameters } from './string-or-i-query-selector-with-parameters';
import { IParameterLink } from './i-parameter-link';
import { StringOrIQuerySelector } from './string-or-i-query-selector';
import { IAutoValue } from './i-auto-value';

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
