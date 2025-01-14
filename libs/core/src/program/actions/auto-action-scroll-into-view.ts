import { Logger } from '../../common/logger';
import { AutoAction } from './auto-action';
import { IAutoAction } from "./types/i-auto-action";
import { AutoActionName } from "./types/auto-action-name";
import { AutoActionResult } from "./types/auto-action-result";
import { IAutoActionScrollIntoView } from './types/i-auto-action-scroll-into-view';

export class AutoActionScrollIntoView extends AutoAction implements IAutoActionScrollIntoView {
	public name = AutoActionName.AutoActionScrollIntoView;
	public selector: string;
	public wait: boolean;
	public behavior : string;
	public block : string;
	public inline: string;

	public static fromJson(jsonAction: IAutoActionScrollIntoView): AutoActionScrollIntoView {
		return new AutoActionScrollIntoView(jsonAction);
	}

	protected constructor(jsonAction: IAutoActionScrollIntoView) {
		super(jsonAction);
		if (jsonAction.name !== this.name) {
			throw new Error(`Wrong Action type, expected '${this.name}' but got ${jsonAction.name}`);
		}

		this.selector = jsonAction.selector;
		this.wait = jsonAction.wait ?? false;
		this.behavior = jsonAction.behavior;
		this.block = jsonAction.block;
		this.inline = jsonAction.inline;
	}

	public async invoke(): Promise<void> {
		try {
			const elements: Element[] = await this.querySelector(this.selector, this.wait);

			const options: any = {};
			if (this.behavior != null) { options.behavior = this.behavior; }
			if (this.block != null) { options.block = this.block; }
			if (this.inline != null) { options.inline = this.inline; }
			elements[0].scrollIntoView(options);

			this.result = AutoActionResult.Success;
		} catch (error) {
			Logger.instance.error('AutoActionScrollIntoView error: ', error);
			throw error;
		}
	}

	public toJson(): IAutoAction {
		const basicJson = (super.toJson() as IAutoActionScrollIntoView);
		basicJson.selector = this.selector;
		basicJson.wait = this.wait;
		basicJson.behavior = this.behavior;
		basicJson.block = this.block;
		basicJson.inline = this.inline;
		return basicJson;
	}
}
