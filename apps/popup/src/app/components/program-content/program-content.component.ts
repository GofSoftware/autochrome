import { Component, OnInit, signal } from '@angular/core';
import { PopupToBackgroundLinkFacade } from '../../business/popup-to-background-link-facade';
import { Logger } from '@autochrome/core/common/logger';
import { IProgramContainerInfo } from '@autochrome/core/program/container/i-program-container';
import { AppService } from '../../business/app.service';
import { EventDisposableComponent } from '../event-disposable.component';
import { ProgramItemComponent } from '../program-item/program-item.component';
import { FormsModule } from '@angular/forms';
import { IBrowserTab } from '@autochrome/core/messaging/i-auto-message';

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
	public loading = signal<boolean>(false);

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
		const currentTabId = AppService.instance.getActiveTab()?.id || null;
		if (currentTabId != null) {
			this.programItems().forEach((item) => {
				item.tabId = currentTabId;
			});
			await PopupToBackgroundLinkFacade.instance.updateContainers(this.programItems().slice());
		}
	}

    public onBrowserTabValueChange() {
        AppService.instance.setActiveTabById(this.browserTabValue());
    }

	public async onFileChange(event: Event) {
		this.loading.set(true);

		const fileList: FileList = (event.target as any).files;
		const files = [];
		for (let i = 0; i < fileList.length; i++){
			files.push(fileList[i]);
		}
		files.sort((a, b) => a.name.localeCompare(b.name));

		try {
			for (let i = 0; i < files.length; i++) {
				Logger.instance.log(`Adding a new program: ${fileList[i].name}`);
				const content = await this.loadFileContent(fileList[i]);
				if (content != null) {
					await this.addProgramItem(content);
				}
				Logger.instance.log(`The new program has been added: ${fileList[i].name}`);
			}
			(document.getElementById('file-selector') as HTMLInputElement).value = '';
		} catch (error: any) {
			console.error(error);
			alert(error?.message ?? 'File upload error...');
		} finally {
			this.loading.set(false);
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

	private updateBrowserTabs(tabs: IBrowserTab[]): void {
        let valueTab: string | null = tabs.length > 0 ? tabs[0].id.toString() : null;
		this.browserTabList.set(tabs.map((tab: IBrowserTab) => {
			if (tab.active) {
                valueTab = tab.id!.toString();
			}
			return {label: tab.title!, id: tab.id!.toString()};
		}));
        if (valueTab != null) {
            this.browserTabValue.set(valueTab);
            this.onBrowserTabValueChange();
        }
	}
}
