import Tab = chrome.tabs.Tab;

export class TabManager {
    private static tabManagerInstance: TabManager;
    public static get instance(): TabManager {
        return TabManager.tabManagerInstance || (TabManager.tabManagerInstance = new TabManager());
    }

    private constructor() {
    }

    private tabMap: Map<number, Tab> = new Map<number, Tab>();

    public async init(): Promise<void> {
        await this.updateTabsInfo();

        [chrome.tabs.onCreated, chrome.tabs.onReplaced, chrome.tabs.onRemoved].forEach((event) => {
            event.addListener(() => { this.updateTabsInfo(); });
        });
    }

    public tab(tabId: number): Tab | undefined {
        return this.tabMap.get(tabId);
    }

    public get tabs(): Tab[] {
        return Array.from(this.tabMap.values());
    }

	public title(tabId: number): string {
		return this.tabMap.has(tabId) ? this.tabMap.get(tabId)!.title ?? '' : 'Unknown';
	}

    public exists(tabId: number) {
        return this.tabMap.has(tabId);
    }

    public async updateTabsInfo(): Promise<void> {
        const tabs = await chrome.tabs.query({});
        this.tabMap.clear();
        tabs.forEach((tab) => {
			if (tab.id == null) {
				throw new Error(`Tab "${tab.title}" has no id`);
			}
			this.tabMap.set(tab.id, tab);
		});
    }
}
