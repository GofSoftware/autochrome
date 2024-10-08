import { Logger } from '../../common/logger';
import { AutoAction } from './auto-action';
import { IAutoAction } from "./types/i-auto-action";
import { AutoActionName } from "./types/auto-action-name";
import { AutoActionResult } from "./types/auto-action-result";
import { IAutoActionSelectFile } from './types/i-auto-action-select-file';

export class AutoActionSelectFile extends AutoAction implements IAutoActionSelectFile {
	public name = AutoActionName.AutoActionSelectFile;
	public selector: string;
	public fileName: string;
	public fileType: string;
	public fileContent: string;
	public wait: boolean;

	public static fromJson(jsonAction: IAutoActionSelectFile): AutoActionSelectFile {
		return new AutoActionSelectFile(jsonAction);
	}

	protected constructor(jsonAction: IAutoActionSelectFile) {
		super(jsonAction);
		if (jsonAction.name !== this.name) {
			throw new Error(`Wrong Action type, expected '${this.name}' but got ${jsonAction.name}`);
		}

		this.selector = jsonAction.selector;
		this.fileName = jsonAction.fileName;
		this.fileType = jsonAction.fileType;
		this.fileContent = jsonAction.fileContent;
		this.wait = jsonAction.wait ?? false;
	}

	public async invoke(): Promise<void> {
		try {
			const elements: Element[] = await this.querySelector(this.selector, this.wait, false);

			await this.setFile(elements[0] as HTMLInputElement);

			this.result = AutoActionResult.Success;
		} catch (error) {
			Logger.instance.error('AutoActionSelectFile error: ', error);
			throw error;
		}
	}

	public toJson(): IAutoAction {
		const basicJson = (super.toJson() as IAutoActionSelectFile);
		basicJson.selector = this.selector;
		basicJson.fileName = this.fileName;
		basicJson.fileType = this.fileType;
		basicJson.fileContent = this.fileContent;
		basicJson.wait = this.wait;
		return basicJson;
	}

	private async setFile(element: HTMLInputElement): Promise<void> {
		// The FileList create workaround: https://qna.habr.com/q/895163

		const bStr = atob(this.fileContent);
		let n = bStr.length;
		const u8arr = new Uint8Array(n);

		while(n--){
			u8arr[n] = bStr.charCodeAt(n);
		}

		const file = new File([u8arr], this.fileName, {type: this.fileType});
		const dt = new DataTransfer();
		dt.items.add(file);
		element.files = dt.files;

		const changeEvent = new Event('change');
		element.dispatchEvent(changeEvent);
	}
}
