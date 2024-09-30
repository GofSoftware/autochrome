import { Component, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IProgramItemCollectionElement, ProgramItemCollection } from './program/program-item-collection';
import { AutoLinkClient } from '@autochrome/core/auto-link/auto-link-client';
import { Logger } from '@autochrome/core/common/logger';
import { TabManager } from "@autochrome/core/common/tab-manager";
import { RobotSettingsGlobalManager } from '@autochrome/core/settings/robot-settings-global-manager';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProgramItemComponent } from './components/program-item/program-item.component';

@Component({
  standalone: true,
	imports: [RouterModule, FormsModule, ProgramItemComponent],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
	public autoPlay = signal<boolean>(false);
	public browserTabList = signal<{id: string; label: string}[]>([]);
	public browserTabValue = signal<string>(null);
	public programItems = signal<IProgramItemCollectionElement[]>([]);

	constructor() {
		ProgramItemCollection.instance().programItemsChange$.pipe(takeUntilDestroyed()).subscribe((items) => {
			this.programItems.set(items);
		});
	}

	public async ngOnInit(): Promise<void> {
		Logger.instance.prefix = 'Autochrome:popup';
		await TabManager.instance.init();
		this.updateBrowserTabs();
		ProgramItemCollection.instance().init();
		await ProgramItemCollection.instance().restore();
		AutoLinkClient.instance().init();

		const settings = await RobotSettingsGlobalManager.instance.getSettings();
		if (settings.autoPlay) {
			this.autoPlay.set(true);
		}
	}

	public async onFileChange(event: Event) {
		const fileList: FileList = (event.target as any).files;
		try {
			for (let i = 0; i < fileList.length; i++) {
				Logger.instance.log(`Adding a new program: ${fileList[i].name}`);
				const content = await this.loadFileContent(fileList[i]);
				if (content != null) {
					await this.addProgramItem(content);
				}
				Logger.instance.log(`The new program has been added: ${fileList[i].name}`);
			}
			(document.getElementById('file-selector') as HTMLInputElement).value = '';
		} catch (error: any) {
			alert(error?.message);
		}
	};

	public onCloseClick(): void {
		window.close();
	}

	public async onAutoPlayChange(): Promise<void> {
		await AutoLinkClient.instance().setGlobalSettings({autoPlay: this.autoPlay()});
	}

	public async onCreateProgramClick(): Promise<void> {
		await chrome.tabs.create({
			url: "editor/index.html"
		});
	}

	public async onSetCurrentClick(): Promise<void> {
		const [currentTab] = await chrome.tabs.query({ active: true });
		if (currentTab != null) {
			this.programItems().forEach((item) => {
				item.programItem.extractedProgramContainer.programContainer.tabId = currentTab.id;
				AutoLinkClient.instance().updateContainer(item.programItem.extractedProgramContainer.programContainer);
			});
		}
	}

	private updateBrowserTabs(): void {
		this.browserTabList.set(TabManager.instance.tabs.map((tab) => {
			if (tab.active) {
				this.browserTabValue.set(tab.id.toString());
			}
			return {label: tab.title, id: tab.id.toString()};
		}));
	}

	private async addProgramItem(content: string): Promise<void> {
		if (this.browserTabValue() == null) {
			throw new Error('Please select a Tab first');
		}
		await ProgramItemCollection.instance().addItem(content, parseInt(this.browserTabValue(), 10));
	}

	private async loadFileContent(file: File): Promise<string> {
		return await new Promise((resolve) => {
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
