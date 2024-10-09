import { IParameterLink } from './i-parameter-link';
import { IAutoAction } from './i-auto-action';

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
