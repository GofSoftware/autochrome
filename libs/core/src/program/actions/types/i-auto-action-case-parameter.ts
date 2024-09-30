import { IAutoAction } from "./i-auto-action";

export enum AutoActionCaseParameterOperator {
    Equal = 'Equal',
    NotEqual = 'NotEqual'
}

export interface IAutoActionCaseParameter extends IAutoAction {
    parameterName: string;
    operator: AutoActionCaseParameterOperator;
    value: any;
    thenActionId: string;
    elseActionId: string;
}
