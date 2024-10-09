import { IParameterLink } from './i-parameter-link';
import { IAutoValue } from './i-auto-value';
import { QuerySelectorWithPropertyLink } from './query-selector-with-property-link';
import { IAutoAction } from './i-auto-action';

export interface IAutoActionSetValue extends IAutoAction {
    selector: QuerySelectorWithPropertyLink;
    wait: boolean;
    value: any | IAutoValue | IParameterLink;
}
