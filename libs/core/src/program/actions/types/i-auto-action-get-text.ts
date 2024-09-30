import { IAutoAction } from './i-auto-action';

export enum AutoActionGetTextType {
    innerText = 'innerText',
    textContent = 'textContent'
}

export interface IAutoActionGetText extends IAutoAction {
    selector: string;
    textType: AutoActionGetTextType;
    wait?: boolean;
}
