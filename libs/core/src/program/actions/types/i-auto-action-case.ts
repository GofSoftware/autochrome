import { QuerySelectorWithPropertyLink } from './query-selector-with-property-link';
import { IAutoAction } from './i-auto-action';

export interface IAutoActionCase extends IAutoAction {
    selector: QuerySelectorWithPropertyLink;
    wait?: boolean;
    thenActionId: string;
    elseActionId: string;
}
