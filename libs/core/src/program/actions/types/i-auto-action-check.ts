import { IAutoAction } from "./i-auto-action";
import { QuerySelectorWithPropertyLink } from "./i-interfaces";

export enum AutoActionCheckType {
    Exists = 'Exists',
    NotExists = 'NotExists'
}

export interface IAutoActionCheck extends IAutoAction {
    selector: QuerySelectorWithPropertyLink;
    wait?: boolean;
    type: AutoActionCheckType;
    silent?: boolean;
    highlight?: boolean;
}
