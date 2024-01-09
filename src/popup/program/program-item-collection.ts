import { IProgramItemUpdateInfo, IProgramItemUpdateInfoType, ProgramItem } from './program-item';
import { ProgramContainer } from '../../core/program/container/program-container';
import { concatMap, filter, Subscription } from 'rxjs';
import { ProgramContainerManager } from '../../core/auto-link/program-container-manager';
import { AutoLinkClient } from '../../core/auto-link/auto-link-client';
import { IAutoMessageDataContainerChanged, IAutoMessageContainerChangeType } from '../../core/auto-link/messaging/i-auto-message';
import { Logger } from '../../core/common/logger';

interface IProgramItemCollectionElement {
	programItem: ProgramItem;
	subscription: Subscription;
}

export class ProgramItemCollection {
	private static programItemCollectionInstance: ProgramItemCollection;

	public static instance(): ProgramItemCollection {
		return ProgramItemCollection.programItemCollectionInstance ||
			(ProgramItemCollection.programItemCollectionInstance = new ProgramItemCollection());
	}

	private tabIdSet: Set<number> = new Set<number>();
	private programItemMap: Map<string, IProgramItemCollectionElement> = new Map<string, IProgramItemCollectionElement>();
	private container: HTMLElement;
	private autoLinkSubscription: Subscription;

	public init(container: HTMLElement): void {
		this.autoLinkSubscription = AutoLinkClient.instance().containerChanges$.pipe(
			filter((event: IAutoMessageDataContainerChanged) => event != null),
			concatMap(async (event: IAutoMessageDataContainerChanged) => {
				Logger.instance.debug(`ProgramItemCollection get event`, event);
				switch (event.type) {
					case IAutoMessageContainerChangeType.New:
						if (!this.programItemMap.has(event.containerId)) {
							const programContainer = await ProgramContainerManager.instance.getContainer(event.containerId);
							this.addProgramItem(programContainer);
							this.render();
						}
						break;
					case IAutoMessageContainerChangeType.Update:
					case IAutoMessageContainerChangeType.Remove:
						break;
					default:
						Logger.instance.warn(`Unknown IAutoMessageContainerChangeType: ${event.type}`);
				}
			})
		).subscribe();
		this.container = container;
	}

	public destroy(): void {
		this.clear();
		this.autoLinkSubscription?.unsubscribe();
	}

	public async addItem(serializedProgram: string, tabId: number): Promise<void> {
		const programContainer = ProgramContainer.create(serializedProgram, tabId);
		const result = await AutoLinkClient.instance().newContainer(programContainer);
		Logger.instance.log(`ProgramItemCollection addItem result: ${result}`);
	}

	public async restore(): Promise<void> {
		this.clear();

		const allContainers = await ProgramContainerManager.instance.getAllContainers();
		allContainers.forEach((container) => {
			this.addProgramItem(container);
		});

		this.render();
		Logger.instance.debug(`ProgramItemCollection ${allContainers.length} items restored`);
	}

	public render(): void {
		this.container.textContent = '';

		const items =  Array.from(this.programItemMap.values()).sort((a, b) =>
			a.programItem.extractedProgramContainer.programContainer.order - b.programItem.extractedProgramContainer.programContainer.order
		).map((item) => {
			return  item.programItem.render();
		});

		items.forEach((programItem: HTMLElement) => {
			this.container.append(programItem);
		});
	}

	private clear(): void {
		this.tabIdSet.clear();
		this.programItemMap.forEach(value => {
			this.destroyProgramItemCollectionItem(value);
		});
	}

	private addProgramItem(programContainer: ProgramContainer): ProgramItem {
		this.tabIdSet.add(programContainer.tabId);
		const programItem = ProgramItem.create(programContainer);
		const subscription = programItem.itemChanged$
			.pipe(filter((info: IProgramItemUpdateInfo) => info != null))
			.subscribe((info: IProgramItemUpdateInfo) => {
				this.programItemChanged(info);
			});
		this.programItemMap.set(programContainer.id, {programItem, subscription});
		return programItem;
	}

	private programItemChanged(info: IProgramItemUpdateInfo): void {
		if (!this.programItemMap.has(info.id)) {
			return;
		}
		if (info.type === IProgramItemUpdateInfoType.Remove) {
			this.destroyProgramItemCollectionItem(this.programItemMap.get(info.id));
		}
		this.render();
	}

	private destroyProgramItemCollectionItem(element: IProgramItemCollectionElement): void {
		element.subscription?.unsubscribe();
		element.programItem.destroy();
		this.programItemMap.delete(element.programItem.extractedProgramContainer.programContainer.id);
	}
}
