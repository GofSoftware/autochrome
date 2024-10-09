import { QuerySelectorWithPropertyLink } from './query-selector-with-property-link';
import { IAutoAction } from './i-auto-action';

export interface IAutoActionDragNDrop extends IAutoAction {
    sourceSelector: QuerySelectorWithPropertyLink;
    targetSelector: QuerySelectorWithPropertyLink;
    wait?: boolean;
    dataTransfer?: string;
}
