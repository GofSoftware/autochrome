import { AutoAction } from './auto-action';
import { InterruptibleUtility } from '../../common/interruptible-utility';
import { IAutoValue, IParameterLink } from './types/i-interfaces';
import { IAutoAction } from "./types/i-auto-action";
import { AutoActionName } from "./types/auto-action-name";
import { AutoActionResult } from "./types/auto-action-result";
import { IAutoActionUrl } from './types/i-auto-action-url';

export class AutoActionUrl extends AutoAction implements IAutoActionUrl {
	public name = AutoActionName.AutoActionUrl;
	public url: string | IAutoValue | IParameterLink;

	public static fromJson(jsonAction: IAutoActionUrl): AutoActionUrl {
		return new AutoActionUrl(jsonAction);
	}

	protected constructor(jsonAction: IAutoActionUrl) {
		super(jsonAction);
		if (jsonAction.name !== this.name) {
			throw new Error(`Wrong Action type, expected '${this.name}' but got ${jsonAction.name}`);
		}
		this.url = jsonAction.url;
	}

	public async invoke(): Promise<void> {

		let url = this.replaceParameters(this.url);
		url = await this.replaceAutoValue(url);

		document.location = url;
		await InterruptibleUtility.justWait(this.timeout, 'Wait until browser reloads.');

		// If we are here then browser for some reason didn't refresh the page, so we have to send failed result.
		this.result = AutoActionResult.Failed;
	}

	public toJson(): IAutoAction {
		const basicJson = (super.toJson() as IAutoActionUrl);
		basicJson.url = this.url;
		return basicJson;
	}
}
