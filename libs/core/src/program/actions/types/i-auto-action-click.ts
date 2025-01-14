import { IAutoAction } from './i-auto-action';
import { QuerySelectorWithPropertyLink } from './i-interfaces';

export enum AutoActionClickType {
    MouseDownFocusMouseUp = 'MouseDownFocusMouseUp',
    Click = 'Click'
}

export interface IAutoActionClick extends IAutoAction {
    selector: QuerySelectorWithPropertyLink;
    smoothMouse?: boolean;
    wait?: boolean;
    clickType?: AutoActionClickType;
}
