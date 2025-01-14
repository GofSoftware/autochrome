import { IAutoAction } from './i-auto-action';

export interface IAutoActionWait extends IAutoAction {
    timeToWait: number;
}
