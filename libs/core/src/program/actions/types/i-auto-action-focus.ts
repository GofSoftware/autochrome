import { QuerySelectorWithPropertyLink } from './query-selector-with-property-link';
import { IAutoAction } from './i-auto-action';

export interface IAutoActionFocus extends IAutoAction {
    selector: QuerySelectorWithPropertyLink;
    smoothMouse?: boolean;
    wait?: boolean;
    blur?: boolean;
}
