import { IAutoAction } from './i-auto-action';
import { IAutoActionCheck } from './i-auto-action-check';

export enum AutoActionGroupOperator {
    And = 'And',
    Or = 'Or'
}

export interface IAutoActionCheckGroup extends IAutoAction {
    operator: AutoActionGroupOperator;
    checkItems: (IAutoActionCheckGroup | IAutoActionCheck)[];
    silent?: boolean;
}
