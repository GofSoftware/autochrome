import { AutoAction, IAutoAction } from './actions/auto-action';
import { AutoActionFactory } from './actions/auto-action-factory';

export interface IAutoProcedure {
	name: string;
	description: string;
	action: IAutoAction;
}

export class AutoProcedure implements IAutoProcedure {
	public static fromJson(procedureJson: IAutoProcedure): AutoProcedure {
		const procedure = new AutoProcedure(procedureJson.name, procedureJson.description);
		procedure.action = AutoActionFactory.instance.fromJson(procedureJson.action);
		return  procedure
	}

	public action: AutoAction;

	constructor(
		public name: string,
		public description: string,
	) {
	}

	public toJson(): IAutoProcedure {
		return {
			name: this.name,
			description: this.description,
			action: this.action?.toJson() || null,
		};
	}
}
