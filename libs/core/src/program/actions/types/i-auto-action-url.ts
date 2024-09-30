import { IAutoAction } from './i-auto-action';
import { IAutoValue, IParameterLink } from './i-interfaces';

export interface IAutoActionUrl extends IAutoAction {
    url: string | IAutoValue | IParameterLink;
}
