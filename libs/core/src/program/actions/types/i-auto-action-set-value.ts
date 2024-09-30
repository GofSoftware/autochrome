import { IAutoAction } from './i-auto-action';
import { IAutoValue, IParameterLink, QuerySelectorWithPropertyLink } from './i-interfaces';

export interface IAutoActionSetValue extends IAutoAction {
    selector: QuerySelectorWithPropertyLink;
    wait: boolean;
    value: any | IAutoValue | IParameterLink;
}
