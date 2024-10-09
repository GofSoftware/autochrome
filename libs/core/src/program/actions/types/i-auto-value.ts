import { AutoValueSourceType } from './auto-value-source-type';
import { QuerySelectorWithPropertyLink } from './query-selector-with-property-link';

export const AutoValueTypeName = 'AutoValue';
export type AutoValueType = 'AutoValue';

export interface IAutoValue {
	type: AutoValueType;
	selector: QuerySelectorWithPropertyLink;
	wait: boolean;
	valueType: AutoValueSourceType;
	attributeName: string;
}
