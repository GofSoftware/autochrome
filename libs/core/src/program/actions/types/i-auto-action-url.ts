import { IParameterLink } from './i-parameter-link';
import { IAutoValue } from './i-auto-value';
import { IAutoAction } from './i-auto-action';

export interface IAutoActionUrl extends IAutoAction {
    url: string | IAutoValue | IParameterLink;
}
