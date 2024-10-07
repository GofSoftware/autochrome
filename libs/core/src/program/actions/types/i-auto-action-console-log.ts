import { IAutoAction } from './i-auto-action';
import { IParameterLink } from './i-interfaces';

export enum AutoActionConsoleLogLevel {
    Error= 'Error',
    Warn= 'Warn',
    Log= 'Log',
    Debug= 'Debug'
}

export interface IAutoActionConsoleLog extends IAutoAction {
    level?: AutoActionConsoleLogLevel;
    message: string | IParameterLink;
}
