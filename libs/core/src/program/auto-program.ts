import { AutoAction, IAutoAction } from './actions/auto-action';
import { AutoActionFactory } from './actions/auto-action-factory';
import { AutoProcedure, IAutoProcedure } from './auto-procedure';
import { AutoActionName } from './actions/action-types';
import { AutoActionProcedure } from './actions/auto-action-procedure';
import { AutoActionCase } from './actions/auto-action-case';
import { AutoActionGoTo } from './actions/auto-action-go-to';
import { Guid } from '../common/guid';

export interface IAutoProgram {
	name: string;
	description: string;
	version: number;
	rootAction: IAutoAction;
	procedures: IAutoProcedure[];
}

const CURRENT_VERSION = 1;

export class AutoProgram implements IAutoProgram {

	public static empty(): AutoProgram {
		const program = new AutoProgram();
		program.version = CURRENT_VERSION;
		program.name = '';
		program.description = '';
		program.rootAction = AutoActionFactory.instance.fromJson({name: AutoActionName.AutoActionEmpty});
		program.procedures = [];
		return program;
	}

	public static fromString(serializedProgram: string): AutoProgram {
		return AutoProgram.fromJson(JSON.parse(serializedProgram));
	}

	public static fromJson(programJson: IAutoProgram): AutoProgram {

		if (programJson?.version !== 1) {
			throw new Error(`Unknown program version: ${programJson?.version}`);
		}

		const program = new AutoProgram();

		program.name = programJson.name;
		program.version = programJson.version;
		program.description = programJson.description;
		program.procedures = (programJson.procedures || []).map((procedure) => AutoProcedure.fromJson(procedure));

		AutoActionFactory.instance.reset();

		if (programJson?.rootAction == null ) {
			throw new Error(`rootAction is null, must be the AutoActionRoot object.`);
		}

		program.rootAction = AutoActionFactory.instance.fromJson(programJson.rootAction);

		// We need the Map of the "not instantiated" IAutoProcedure-s because we will instantiate them for each AutoActionProcedure call.
		const procedureMap = new Map<string, IAutoProcedure>();
		(programJson.procedures || []).forEach((procedure) => procedureMap.set(procedure.name, procedure));

		program.rootAction.traverse((action) => {
			if (action.name === AutoActionName.AutoActionProcedure) {
				const autoActionProcedure = action as AutoActionProcedure;
				if (!procedureMap.has(autoActionProcedure.procedureName)) {
					return false;
				}
				const procedureDescription = AutoProcedure.fromJson(procedureMap.get(autoActionProcedure.procedureName));

				// Set the Parameters to each action and prepend all procedure action ids with the root actionId,
				// so we will not have the same ids for the user created ids
				const procUniqueId = Guid.v4();
				const idMap = new Map<string, string>();
				procedureDescription.action.traverse((action: AutoAction) => {
					const newId = `Proc[${procUniqueId}]:${action.id}`;
					idMap.set(action.id, newId);
					action.id = newId;

					action.parameters = autoActionProcedure.parameters;
					return true;
				});

				// Replace ids in the Case and GoTo actions
				procedureDescription.action.traverse((action: AutoAction) => {
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

				autoActionProcedure.children.push(procedureDescription.action);
				procedureDescription.action.previous = autoActionProcedure;
				const procNextAction = autoActionProcedure.next;
				autoActionProcedure.next = procedureDescription.action;
				const lastProcedureAction = procedureDescription.action.getLastAction();
				lastProcedureAction.next = procNextAction;
				if (procNextAction != null) { // can be null if the proc is the last action in the program.
					procNextAction.previous = lastProcedureAction;
				}
			}
			return true;
		});

		program.rootAction.traverse((action) => {
			program.actionMap.set(action.id, action);
			return true;
		});
		return program;
	}

	public name: string;
	public description: string;
	public version: number;
	public rootAction: AutoAction;
	public error: string;
	public procedures: AutoProcedure[];

	private actionMap: Map<string, AutoAction> = new Map<string, AutoAction>();

	public get count(): number {
		return this.actionMap.size;
	}

	public getActionById(id: string): AutoAction {
		return this.actionMap.get(id);
	}

	public toJson(): IAutoProgram {
		return {
			name: this.name,
			description: this.description,
			version: this.version,
			rootAction: this.rootAction?.toJson() || null,
			procedures: (this.procedures || []).map((procedure) => procedure.toJson())
		};
	}
}
