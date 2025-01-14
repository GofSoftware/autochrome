import { Logger } from '../../common/logger';
import { AutoAction } from './auto-action';
import { IAutoAction } from "./types/i-auto-action";
import { AutoActionName } from "./types/auto-action-name";
import { AutoActionResult } from "./types/auto-action-result";
import {
    AutoActionCaseParameterOperator,
    IAutoActionCaseParameter
} from "./types/i-auto-action-case-parameter";

export class AutoActionCaseParameter extends AutoAction implements IAutoActionCaseParameter {
	public name = AutoActionName.AutoActionCaseParameter;
	public parameterName: string;
	public operator: AutoActionCaseParameterOperator;
	public value: any;
	public thenActionId: string;
	public elseActionId: string;

	public static fromJson(jsonAction: IAutoActionCaseParameter): AutoActionCaseParameter {
		return new AutoActionCaseParameter(jsonAction);
	}

	protected constructor(jsonAction: IAutoActionCaseParameter) {
		super(jsonAction);
		if (jsonAction.name !== this.name) {
			throw new Error(`Wrong Action type, expected '${this.name}' but got ${jsonAction.name}`);
		}
		this.parameterName = jsonAction.parameterName;
		this.operator = jsonAction.operator;
		this.value = jsonAction.value;
		this.thenActionId = jsonAction.thenActionId;
		this.elseActionId = jsonAction.elseActionId;
	}

	public async invoke(): Promise<void> {
		try {
			const parameterValue = this.getParameterValue(this.parameterName);
			let result = false;
			switch(this.operator) {
				case AutoActionCaseParameterOperator.Equal:
					result = parameterValue === this.value;
					break;
				case AutoActionCaseParameterOperator.NotEqual:
					result = parameterValue !== this.value;
					break;
				default:
					throw new Error(`AutoActionCaseParameter: unknown operator: ${this.operator}`);
			}

			if (result) {
				this.resultValue = this.thenActionId;
			} else {
				this.resultValue = this.elseActionId;
			}

			this.result = AutoActionResult.Success;
		} catch (error) {
			Logger.instance.error(`${this.name} error: `, error);
			throw error;
		}
	}

	public override toJson(): IAutoAction {
		const basicJson = (super.toJson() as IAutoActionCaseParameter);
		basicJson.parameterName = this.parameterName;
		basicJson.operator = this.operator;
		basicJson.value = this.value;
		basicJson.thenActionId = this.thenActionId;
		basicJson.elseActionId = this.elseActionId;
		return basicJson;
	}
}
