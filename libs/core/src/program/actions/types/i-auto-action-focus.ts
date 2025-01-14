import { IAutoAction } from './i-auto-action';
import { QuerySelectorWithPropertyLink } from './i-interfaces';

export interface IAutoActionFocus extends IAutoAction {
    selector: QuerySelectorWithPropertyLink;
    smoothMouse?: boolean;
    wait?: boolean;
    blur?: boolean;
}
