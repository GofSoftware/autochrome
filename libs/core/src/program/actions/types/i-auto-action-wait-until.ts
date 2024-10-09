import { QuerySelectorWithPropertyLink } from './query-selector-with-property-link';
import { IAutoAction } from './i-auto-action';

export enum AutoActionWaitUntilType {
    appear = 'appear',
    disappear = 'disappear'
}

export interface IAutoActionWaitUntil extends IAutoAction {
    untilType: AutoActionWaitUntilType;
    selector: QuerySelectorWithPropertyLink;
}
