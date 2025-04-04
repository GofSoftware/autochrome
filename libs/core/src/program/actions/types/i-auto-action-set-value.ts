import { IAutoAction } from './i-auto-action';
import { IAutoValue, IParameterLink, QuerySelectorWithPropertyLink } from './i-interfaces';
import { DomEventName } from '@autochrome/core/program/actions/types/dom-event-name';

export interface IAutoActionSetValue extends IAutoAction {
    selector: QuerySelectorWithPropertyLink;
    wait: boolean;
	events: DomEventName[] | undefined;
    value: any | IAutoValue | IParameterLink;
}
