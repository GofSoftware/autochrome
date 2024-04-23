import './html/popup.less';
import { ProgramItemCollection } from './program/program-item-collection';
import { AutoLinkClient } from '../core/auto-link/auto-link-client';
import { Logger } from '../core/common/logger';
import { TabManager } from "../core/common/tab-manager";
import { RobotSettingsGlobal } from '../core/settings/robot-settings-global';

/**
 * This is intended to be a top header
 */

/**
 * This is something about Popup
 */
class Popup {
	private static popupInstance: Popup;
	public static get instance(): Popup {
		return Popup.popupInstance || (Popup.popupInstance = new Popup());
	}

	protected constructor() {
	}

	public async init(): Promise<void> {
		Logger.instance.prefix = 'Autochrome:popup';
        await TabManager.instance.init();
		this.updateBrowserTabs();
		ProgramItemCollection.instance().init(document.getElementById('uploaded-programs-holder'));
		await ProgramItemCollection.instance().restore();
		AutoLinkClient.instance().init();

		// document.getElementById('program-edit-button').onclick = () => {
		// 	chrome.tabs.create({
		// 		url: "html/program-editor.html"
		// 	});
		// };

		document.getElementById('close-window').onclick = async () => {
			window.close();
		};

		document.getElementById('file-selector').onchange = async (event) => {
			const fileList: FileList = (event.target as any).files;
			for (let i = 0; i < fileList.length; i++) {
				Logger.instance.log(`Adding a new program: ${fileList[i].name}`);
				const content = await this.loadFileContent(fileList[i]);
				if (content != null) {
					await this.addProgramItem(content);
				}
				Logger.instance.log(`The new program has been added: ${fileList[i].name}`);
			}
			(document.getElementById('file-selector') as HTMLInputElement).value = '';
		};

		document.getElementById('auto-play').onchange = async () => {
			const autoPlay = (document.getElementById('auto-play') as HTMLInputElement).checked;
			await AutoLinkClient.instance().setGlobalSettings({autoPlay});
		};

		document.getElementById('a-set-current').onclick = async () => {
			const [currentTab] = await chrome.tabs.query( { active: true });
			if (currentTab != null) {
				ProgramItemCollection.instance().forEach((item) => {
					item.programItem.extractedProgramContainer.programContainer.tabId = currentTab.id;
					AutoLinkClient.instance().updateContainer(item.programItem.extractedProgramContainer.programContainer);
				})
			}
		}

		const settings = await RobotSettingsGlobal.instance.getSettings();
		if (settings.autoPlay === true) {
			(document.getElementById('auto-play') as HTMLInputElement).checked = true;
		}
	}

	private updateBrowserTabs(): void {
		const selectElement = this.tabSelectElement();
		while (selectElement.options.length > 0) {
			selectElement.remove(0);
		}

        TabManager.instance.tabs.forEach((tab) => {
            const option = new Option(tab.title, tab.id.toString(), tab.active, tab.active);
            selectElement.options.add(option);
        });
	}

	private async addProgramItem(content: string): Promise<void> {
		const tabId = this.tabSelectElement().value;
		if (tabId == null) {
			alert('Please select a Tab first');
		}
		await ProgramItemCollection.instance().addItem(content, parseInt(tabId, 10));
	}

	private tabSelectElement(): HTMLSelectElement {
		return document.getElementById('browsers-tabs-select') as HTMLSelectElement;
	}

	private async loadFileContent(file: File): Promise<string> {
		return await new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.addEventListener('load', async (event) => {
				try {
					resolve(event.target.result as string);
				} catch (error) {
					console.error(error);
					resolve(null);
				}
			});
			reader.readAsText(file);
		});
	}
}

Popup.instance.init();
