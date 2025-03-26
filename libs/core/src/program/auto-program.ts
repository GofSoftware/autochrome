import { AutoAction } from './actions/auto-action';
import { AutoActionFactory } from './actions/auto-action-factory';
import { AutoActionName } from './actions/types/auto-action-name';
import { AutoProcedure } from './auto-procedure';
import { AUTO_PROGRAM_CURRENT_VERSION, IAutoProgram } from './i-auto-program';

export class AutoProgram implements IAutoProgram {

	public static empty(): AutoProgram {
		return new AutoProgram(
			'',
			'',
			AUTO_PROGRAM_CURRENT_VERSION,
			AutoActionFactory.instance.fromJson({name: AutoActionName.AutoActionEmpty}),
			[],
			false
		);
	}

	public static fromString(serializedProgram: string, globalProcedures: AutoProcedure[]): AutoProgram {
		return AutoProgram.fromJson(JSON.parse(serializedProgram), globalProcedures);
	}

	public static fromJson(programJson: IAutoProgram, globalProcedures: AutoProcedure[]): AutoProgram {

		if (programJson?.version !== 1) {
			throw new Error(`Unknown program version: ${programJson?.version}`);
		}

		if (programJson?.rootAction == null ) {
			throw new Error(`rootAction is null, must be the AutoActionRoot object.`);
		}

		AutoActionFactory.instance.reset();

		(globalProcedures || []).forEach((procedure) => AutoActionFactory.instance.setProcedure(procedure));

		const procedures = (programJson.procedures || []).map((procedure) => {
			if (AutoActionFactory.instance.hasGlobalProcedure(procedure.name)) {
				throw new Error(`Program "${programJson.name}" has procedure with the same name as the global one: "${procedure.name}"`);
			}
			AutoActionFactory.instance.setProcedure(procedure);
			return AutoProcedure.fromJson(procedure);
		});

		const program = new AutoProgram(
			programJson.name,
			programJson.description,
			programJson.version,
			AutoActionFactory.instance.fromJson(programJson.rootAction),
			procedures,
			programJson.excluded || false
		);

		const idSet = new Set<string>();

		program.rootAction.traverse((action) => {
			if (idSet.has(action.id)) {
				throw new Error(`Not unique id: ${action.id}`);
			}
			idSet.add(action.id);
			program.actionMap.set(action.id, action);
			return true;
		});
		return program;
	}

	constructor(
		public name: string,
		public description: string,
		public version: number,
		public rootAction: AutoAction,
		public procedures: AutoProcedure[] = [],
		public excluded: boolean,
		public error: string | null = null
	) {
	}

	private actionMap: Map<string, AutoAction> = new Map<string, AutoAction>();

	public get count(): number {
		return this.actionMap.size;
	}

	public getActionById(id: string): AutoAction | undefined {
		return this.actionMap.get(id);
	}

	public toJson(): IAutoProgram {
		return {
			name: this.name,
			description: this.description,
			version: this.version,
			rootAction: this.rootAction?.toJson() || null,
			procedures: (this.procedures || []).map((procedure) => procedure.toJson()),
			excluded: this.excluded
		};
	}
}
