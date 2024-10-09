import { StringOrIQuerySelector } from './string-or-i-query-selector';

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
