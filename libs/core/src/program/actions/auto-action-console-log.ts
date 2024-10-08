import { AutoAction } from './auto-action';
import { IParameterLink } from './types/i-interfaces';
import { IAutoAction } from "./types/i-auto-action";
import { AutoActionName } from "./types/auto-action-name";
import { AutoActionResult } from "./types/auto-action-result";
import { AutoActionConsoleLogLevel, IAutoActionConsoleLog } from './types/i-auto-action-console-log';

export class AutoActionConsoleLog extends AutoAction implements IAutoActionConsoleLog {
	public name = AutoActionName.AutoActionConsoleLog;
	level: AutoActionConsoleLogLevel;
	message: string | IParameterLink;

	public static fromJson(jsonAction: IAutoActionConsoleLog): AutoActionConsoleLog {
		return new AutoActionConsoleLog(jsonAction);
	}

	protected constructor(jsonAction: IAutoActionConsoleLog) {
		super(jsonAction);
		if (jsonAction.name !== this.name) {
			throw new Error(`Wrong Action type, expected '${this.name}' but got ${jsonAction.name}`);
		}
		this.level = jsonAction.level ?? AutoActionConsoleLogLevel.Log;
		this.message = jsonAction.message;
	}

	public async invoke(): Promise<void> {
		const resolvedMessage = this.replaceParameters(this.message);

		switch (this.level) {
			case AutoActionConsoleLogLevel.Error:
				console.error(resolvedMessage);
				break;
			case AutoActionConsoleLogLevel.Warn:
				console.warn(resolvedMessage);
				break;
			case AutoActionConsoleLogLevel.Log:
				console.log(resolvedMessage);
				break;
			case AutoActionConsoleLogLevel.Debug:
				console.debug(resolvedMessage);
				break;
			default:
				throw new Error(`AutoActionConsoleLog: unknown level: ${this.level}`);
		}
		this.result = AutoActionResult.Success;
	}

	public toJson(): IAutoAction {
		const basicJson = (super.toJson() as IAutoActionConsoleLog);
		basicJson.level = this.level;
		basicJson.message = this.message;
		return basicJson;
	}
}
