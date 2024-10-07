import { IAutoAction } from './i-auto-action';
import { QuerySelectorWithPropertyLink } from './i-interfaces';

export interface IAutoActionDragNDrop extends IAutoAction {
    sourceSelector: QuerySelectorWithPropertyLink;
    targetSelector: QuerySelectorWithPropertyLink;
    wait?: boolean;
    dataTransfer?: string;
}
