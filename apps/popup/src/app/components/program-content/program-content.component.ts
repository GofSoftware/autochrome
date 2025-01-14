import { Component, OnInit, signal } from '@angular/core';
import Tab = chrome.tabs.Tab;
import { PopupToBackgroundLinkFacade } from '../../business/popup-to-background-link-facade';
import { Logger } from '@autochrome/core/common/logger';
import { IProgramContainerInfo } from '@autochrome/core/program/container/i-program-container';
import { AppService } from '../../business/app.service';
import { EventDisposableComponent } from '../event-disposable.component';
import { ProgramItemComponent } from '../program-item/program-item.component';
import { FormsModule } from '@angular/forms';

@Component({
	selector: 'app-program-content',
	standalone: true,
	templateUrl: 'program-content.component.html',
	imports: [
		ProgramItemComponent,
		FormsModule
	],
	styleUrl: 'program-content.component.scss'
})
export class ProgramContentComponent extends EventDisposableComponent implements OnInit {

	public browserTabList = signal<{id: string; label: string}[]>([]);
	public browserTabValue = signal<string | null>(null);
	public programItems = signal<IProgramContainerInfo[]>([]);

	public ngOnInit(): void {
		this.registerSubscription(AppService.instance.programItems$.subscribe((items) => {
			this.programItems.set(items || []);
		}));

		this.registerSubscription(AppService.instance.programItemsUpdate$.subscribe((items: Partial<IProgramContainerInfo>[]) => {
			const map = items.reduce((result, item) => {
				if (item.id != null) {
					result.set(item.id, item);
				}
				return result;
			}, new Map<string, Partial<IProgramContainerInfo>>());
			this.programItems.set(this.programItems().map((item) =>{
				if (map.has(item.id)) {
					return Object.assign({}, item, map.get(item.id));
				}
				return item;
			}));
		}));
		this.registerSubscription(AppService.instance.browserTabs$.subscribe((tabs) => {
			this.updateBrowserTabs(tabs!);
		}));
	}

	public async onSetCurrentClick(): Promise<void> {
		const [currentTab] = await chrome.tabs.query({ active: true });
		if (currentTab != null) {
			this.programItems().forEach((item) => {
				item.tabId = currentTab.id!;
			});
			await PopupToBackgroundLinkFacade.instance.updateContainers(this.programItems().slice());
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
	}

	public async onCreateProgramClick(): Promise<void> {
		await chrome.tabs.create({
			url: "editor/index.html"
		});
	}

	private async addProgramItem(content: string): Promise<void> {
		if (this.browserTabValue() == null) {
			throw new Error('Please select a Tab first');
		}
		await PopupToBackgroundLinkFacade.instance.newContainer(content, parseInt(this.browserTabValue()!, 10));
	}

	private async loadFileContent(file: File): Promise<string | null> {
		return await new Promise((resolve) => {
			const reader = new FileReader();
			reader.addEventListener('load', async (event) => {
				try {
					resolve(event.target?.result as string);
				} catch (error) {
					console.error(error);
					resolve(null);
				}
			});
			reader.readAsText(file);
		});
	}

	private updateBrowserTabs(tabs: Tab[]): void {
		this.browserTabList.set(tabs.map((tab: Tab) => {
			if (tab.active) {
				this.browserTabValue.set(tab.id!.toString());
			}
			return {label: tab.title!, id: tab.id!.toString()};
		}));
	}
}
