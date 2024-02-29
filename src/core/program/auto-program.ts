import { AutoAction, IAutoAction } from './actions/auto-action';
import { AutoActionFactory } from './actions/auto-action-factory';
import { AutoProcedure, IAutoProcedure } from './auto-procedure';
import { AutoActionName } from './actions/action-types';
import { AutoActionProcedure } from './actions/auto-action-procedure';

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
		program.rootAction = null;
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

		const procedureMap = new Map<string, IAutoProcedure>();
		// We need the Map of the not instantiated IAutoProcedure-s because we will instantiate them for each AutoActionProcedure call.
		(programJson.procedures || []).forEach((procedure) => procedureMap.set(procedure.name, procedure));

		program.rootAction.traverse((action) => {
			if (action.name === AutoActionName.AutoActionProcedure) {
				const autoActionProcedure = action as AutoActionProcedure;
				if (!procedureMap.has(autoActionProcedure.procedureName)) {
					return;
				}
				const procedureDescription = AutoProcedure.fromJson(procedureMap.get(autoActionProcedure.procedureName));
				procedureDescription.action.traverse((action: AutoAction) => {
					action.parameters = autoActionProcedure.parameters;
					return true;
				});
				autoActionProcedure.children.push(procedureDescription.action);
				procedureDescription.action.previous = autoActionProcedure;
				const procNextAction = autoActionProcedure.next;
				autoActionProcedure.next = procedureDescription.action;
				const lastProcedureAction = procedureDescription.action.getLastAction();
				lastProcedureAction.next = procNextAction;
				procNextAction.previous = lastProcedureAction;
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
