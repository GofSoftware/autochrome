import { IAutoAction, AutoAction } from './auto-action';
import { AutoActionName, AutoActionResult } from './action-types';
import { InterruptibleUtility } from '../../common/interruptible-utility';

export interface IAutoActionUrl extends IAutoAction {
	url: string;
}

export class AutoActionUrl extends AutoAction implements IAutoActionUrl {
	public name = AutoActionName.AutoActionUrl;
	public url: string;

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
		document.location = this.url;
		await InterruptibleUtility.justWait(this.timeout, 'Wait until browser reloads');
		// If we are here then browser for some reason didn't refresh the page, so we have to send failed result.
		this.result = AutoActionResult.Failed;
	}

	public toJson(): IAutoAction {
		const basicJson = (super.toJson() as IAutoActionUrl);
		basicJson.url = this.url;
		return basicJson;
	}
}
