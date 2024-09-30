import { IAutoAction } from './actions/types/i-auto-action';

export interface IAutoProcedure {
    name: string;
    description: string;
    action: IAutoAction;
}
