import { IAutoAction } from './i-auto-action';

export interface IAutoActionGoTo extends IAutoAction {
    goToActionId: string;
}
