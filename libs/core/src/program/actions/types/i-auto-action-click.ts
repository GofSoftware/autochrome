import { QuerySelectorWithPropertyLink } from './query-selector-with-property-link';
import { IAutoAction } from './i-auto-action';

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
