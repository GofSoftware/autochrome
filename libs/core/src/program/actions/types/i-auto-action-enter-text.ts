import { IAutoAction } from './i-auto-action';

export interface IAutoActionEnterText extends IAutoAction {
    selector: string;
    text: string;
    wait?: boolean;
    focusBefore?: boolean;
    blurAfter?: boolean;
}
