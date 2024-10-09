import { QuerySelectorWithPropertyLink } from './query-selector-with-property-link';
import { IAutoAction } from './i-auto-action';

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
