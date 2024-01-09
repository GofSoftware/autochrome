import { IAutoAction, AutoAction } from './actions/auto-action';
import { AutoActionFactory } from './actions/auto-action-factory';

export interface IAutoProgram {
	name: string;
	description: string;
	version: number;
	rootAction: IAutoAction;
}

const CURRENT_VERSION = 1;

export class AutoProgram implements IAutoProgram {

	public static empty(): AutoProgram {
		const program = new AutoProgram();
		program.version = CURRENT_VERSION;
		program.name = '';
		program.description = '';
		program.rootAction = null;
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

		if (programJson?.rootAction == null ) {
			throw new Error(`rootAction is null, must be the AutoActionRoot object.`);
		}

		AutoActionFactory.instance.reset();
		program.rootAction = AutoActionFactory.instance.fromJson(programJson.rootAction);
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
		};
	}
}
