import { AutoAction } from './auto-action';
import { cloneDeep } from 'lodash-es';
import { IAutoAction } from "./types/i-auto-action";
import { AutoActionName } from "./types/auto-action-name";
import { AutoActionResult } from "./types/auto-action-result";
import { IAutoActionProcedure } from './types/i-auto-action-procedure';

export class AutoActionProcedure extends AutoAction implements IAutoActionProcedure {
	public name = AutoActionName.AutoActionProcedure;
	public procedureName: string;

	public static fromJson(jsonAction: IAutoActionProcedure): AutoActionProcedure {
		return new AutoActionProcedure(jsonAction);
	}

	protected constructor(jsonAction: IAutoActionProcedure) {
		super(jsonAction);
		if (jsonAction.name !== this.name) {
			throw new Error(`Wrong Action type, expected '${this.name}' but got ${jsonAction.name}`);
		}
		this.procedureName = jsonAction.procedureName;
		this.parameters = cloneDeep(jsonAction.parameters || []);
	}

	public async invoke(): Promise<void> {
		this.result = AutoActionResult.Success; // Assuming the actual actions inside the children property.
	}

	public toJson(): IAutoAction {
		const basicJson = (super.toJson() as IAutoActionProcedure);
		basicJson.procedureName = this.procedureName;
		basicJson.parameters = cloneDeep(this.parameters);
		// Clear the children because they are populated from the Procedure Description when instantiate the ActionProcedure
		basicJson.children = [];
		return basicJson;
	}
}
