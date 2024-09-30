import { IAutoAction } from "./i-auto-action";
import { QuerySelectorWithPropertyLink } from "./i-interfaces";

export interface IAutoActionCase extends IAutoAction {
    selector: QuerySelectorWithPropertyLink;
    wait?: boolean;
    thenActionId: string;
    elseActionId: string;
}
