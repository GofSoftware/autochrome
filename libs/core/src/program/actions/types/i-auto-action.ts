import { AutoActionName } from "./auto-action-name";
import { IAutoParameter } from "./i-interfaces";

/**
 * The base interface for all actions, includes fields that can be set in any nested action.
 * @id string is not required and will be set automatically when a Program is loaded. You only have to set the id if you are planing to
 * change the program flow and go directly to the action.
 */
export interface IAutoAction {
    id?: string; // A little help to a user, do not generate id if it is not really necessary (not a goto action for example)
    name: AutoActionName;
    description?: string;
    continueAfterFail?: boolean;
    timeout?: number;
    children?: IAutoAction[] | null;
    parameters?: IAutoParameter[];
}
