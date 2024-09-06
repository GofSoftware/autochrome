import { AutoAction, IAutoAction } from './actions/auto-action';
import { AutoActionFactory } from './actions/auto-action-factory';
import { AutoActionName } from '@autochrome/core/program/actions/action-types';
import { AutoActionCase } from '@autochrome/core/program/actions/auto-action-case';
import { AutoActionGoTo } from '@autochrome/core/program/actions/auto-action-go-to';
import { IAutoParameter } from '@autochrome/core/program/actions/i-interfaces';

export interface IAutoProcedure {
	name: string;
	description: string;
	action: IAutoAction;
}

export class AutoProcedure implements IAutoProcedure {

	public static fromJson(procedureJson: IAutoProcedure): AutoProcedure {
		const procedure = new AutoProcedure(procedureJson.name, procedureJson.description);
		procedure.action = AutoActionFactory.instance.fromJson(procedureJson.action);
		return procedure
	}

	public action: AutoAction;

	constructor(
		public name: string,
		public description: string,
	) {
	}

	public instantiateAction(parentId: string, parameters: IAutoParameter[]): AutoAction {
		const action = AutoActionFactory.instance.fromJson(this.action);

		// Set the Parameters to each action and prepend all procedure action ids with the root actionId,
		// so we will not have the same ids for the user created ids

		const idMap = new Map<string, string>();

		action.traverse((action: AutoAction) => {
			const newId = `Proc[${parentId}]:${action.id}`;
			idMap.set(action.id, newId);
			action.id = newId;

			action.parameters = parameters;
			return true;
		});

		// Replace ids in the Case and GoTo actions
		action.traverse((action: AutoAction) => {
			switch (action.name) {
				case AutoActionName.AutoActionCase:
				case AutoActionName.AutoActionCaseParameter:
					const caseAction = action as AutoActionCase;
					if (!idMap.has(caseAction.elseActionId) || !idMap.has(caseAction.thenActionId)) {
						throw new Error(`${action.name}:${action.id} cannot find the corresponding action id for elseActionId: ${caseAction.elseActionId} or thenActionId: ${caseAction.thenActionId}`);
					}
					caseAction.elseActionId = idMap.get(caseAction.elseActionId);
					caseAction.thenActionId = idMap.get(caseAction.thenActionId);
					break;
				case AutoActionName.AutoActionGoTo:
					const goToAction = action as AutoActionGoTo;
					if (!idMap.has(goToAction.goToActionId)) {
						throw new Error(`${action.name}:${action.id} cannot find the corresponding action id for goToActionId: ${goToAction.goToActionId}`);
					}
					goToAction.goToActionId = idMap.get(goToAction.goToActionId);
					break;
			}
			return true;
		});

		return action;
	}

	public toJson(): IAutoProcedure {
		return {
			name: this.name,
			description: this.description,
			action: this.action?.toJson() || null,
		};
	}
}
