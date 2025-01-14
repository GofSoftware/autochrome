import { IAutoAction } from './i-auto-action';
import { QuerySelectorWithPropertyLink } from './i-interfaces';

export enum AutoActionWaitUntilType {
    appear = 'appear',
    disappear = 'disappear'
}

export interface IAutoActionWaitUntil extends IAutoAction {
    untilType: AutoActionWaitUntilType;
    selector: QuerySelectorWithPropertyLink;
}
