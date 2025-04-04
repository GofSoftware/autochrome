import { AutoAction } from './actions/auto-action';
import { AutoActionFactory } from './actions/auto-action-factory';
import { AutoActionName } from './actions/types/auto-action-name';
import { AutoActionCase } from './actions/auto-action-case';
import { AutoActionGoTo } from './actions/auto-action-go-to';
import { IAutoParameter } from './actions/types/i-interfaces';
import { IAutoProcedure } from './i-auto-procedure';
import { IAutoAction } from './actions/types/i-auto-action';

export class AutoProcedure implements IAutoProcedure {
	public static fromJson(procedureJson: IAutoProcedure): AutoProcedure {
		if (procedureJson.action == null) {
			throw new Error(`AutoProcedure.fromJson - action is required`);
		}
		return new AutoProcedure(procedureJson.name, procedureJson.description, procedureJson.global, procedureJson.action);
	}

	public static instantiateAction(procedureRootAction: IAutoAction, parentId: string, parameters: IAutoParameter[]): AutoAction {
		const rootAction = AutoActionFactory.instance.fromJson(procedureRootAction);

		// Set the Parameters to each action and prepend all procedure action ids with the root actionId,
		// so we will not have the same ids for the user created ids

		const idMap = new Map<string, string>();

		rootAction.traverse((action: AutoAction) => {
			const newId = `Proc[${parentId}]:${action.id}`;
			idMap.set(action.id, newId);
			action.id = newId;

			action.parameters = parameters;
			return true;
		});

		// Replace ids in the Case and GoTo actions
		rootAction.traverse((action: AutoAction) => {
			switch (action.name) {
				case AutoActionName.AutoActionCase:
				case AutoActionName.AutoActionCaseParameter: {
						const caseAction = action as AutoActionCase;
						if (!idMap.has(caseAction.elseActionId) || !idMap.has(caseAction.thenActionId)) {
							throw new Error(`"${action.name}:${action.id}" - cannot find the corresponding action id for elseActionId: ${caseAction.elseActionId} or thenActionId: ${caseAction.thenActionId}`);
						}
						caseAction.elseActionId = idMap.get(caseAction.elseActionId)!;
						caseAction.thenActionId = idMap.get(caseAction.thenActionId)!;
					}
					break;
				case AutoActionName.AutoActionGoTo: {
						const goToAction = action as AutoActionGoTo;
						if (!idMap.has(goToAction.goToActionId)) {
							throw new Error(`"${action.name}:${action.id}" - cannot find the corresponding action id for goToActionId: ${goToAction.goToActionId}`);
						}
						goToAction.goToActionId = idMap.get(goToAction.goToActionId)!;
					}
					break;
			}
			return true;
		});

		return rootAction;
	}

	public action: AutoAction;
	public global: boolean;

	constructor(
		public name: string,
		public description: string,
		global: boolean | undefined,
		action: IAutoAction
	) {
		this.action = AutoActionFactory.instance.fromJson(action)
		this.global = global ?? false;
	}

	public toJson(): IAutoProcedure {
		return {
			name: this.name,
			description: this.description,
			global: this.global,
			action: this.action?.toJson()
		};
	}
}
