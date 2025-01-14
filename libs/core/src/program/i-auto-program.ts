import { IAutoAction } from './actions/types/i-auto-action';
import { IAutoProcedure } from './i-auto-procedure';

export interface IAutoProgram {
    name: string;
    description: string;
    version: number;
    rootAction: IAutoAction;
    procedures: IAutoProcedure[];
}

export const AUTO_PROGRAM_CURRENT_VERSION = 1;
