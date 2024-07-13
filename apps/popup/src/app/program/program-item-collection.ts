import { IProgramItemUpdateInfo, IProgramItemUpdateInfoType, ProgramItem } from './program-item';
import { ProgramContainer } from '@autochrome/core/program/container/program-container';
import { concatMap, filter, Subject, Subscription } from 'rxjs';
import { ProgramContainerManager } from '@autochrome/core/auto-link/program-container-manager';
import { AutoLinkClient } from '@autochrome/core/auto-link/auto-link-client';
import { IAutoMessageDataContainerChanged, IAutoMessageContainerChangeType } from '@autochrome/core/auto-link/messaging/i-auto-message';
import { Logger } from '@autochrome/core/common/logger';

export interface IProgramItemCollectionElement {
	programItem: ProgramItem;
	subscription: Subscription;
}

export class ProgramItemCollection {
	private static programItemCollectionInstance: ProgramItemCollection;

	public static instance(): ProgramItemCollection {
		return ProgramItemCollection.programItemCollectionInstance ||
			(ProgramItemCollection.programItemCollectionInstance = new ProgramItemCollection());
	}

	private programItemsChangeSubject$ = new Subject<IProgramItemCollectionElement[]>();
	public get programItemsChange$() { return this.programItemsChangeSubject$.asObservable(); }

	private tabIdSet: Set<number> = new Set<number>();
	private programItemMap: Map<string, IProgramItemCollectionElement> = new Map<string, IProgramItemCollectionElement>();
	private autoLinkSubscription: Subscription;

	public init(): void {
		this.autoLinkSubscription = AutoLinkClient.instance().containerChanges$.pipe(
			filter((event: IAutoMessageDataContainerChanged) => event != null),
			concatMap(async (event: IAutoMessageDataContainerChanged) => {
				Logger.instance.debug(`ProgramItemCollection get event`, event);
				switch (event.type) {
					case IAutoMessageContainerChangeType.New:
						if (!this.programItemMap.has(event.containerId)) {
							const programContainer = await ProgramContainerManager.instance.getContainer(event.containerId);
							this.addProgramItem(programContainer);
							this.notifyChanges();
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
	}

	public destroy(): void {
		this.clear();
		this.autoLinkSubscription?.unsubscribe();
	}

	// public forEach(
	// 	callback: (programItem: IProgramItemCollectionElement, key:string, map: Map<string, IProgramItemCollectionElement>) => void
	// ): void {
	// 	this.programItemMap.forEach(callback);
	// }

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

		this.notifyChanges();
		Logger.instance.debug(`ProgramItemCollection ${allContainers.length} items restored`);
	}

	private notifyChanges(): void {
		const elements = Array.from(this.programItemMap.values()).sort((a, b) =>
			a.programItem.extractedProgramContainer.programContainer.order - b.programItem.extractedProgramContainer.programContainer.order
		);
		this.programItemsChangeSubject$.next(elements);
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
		this.notifyChanges();
	}

	private destroyProgramItemCollectionItem(element: IProgramItemCollectionElement): void {
		element.subscription?.unsubscribe();
		element.programItem.destroy();
		this.programItemMap.delete(element.programItem.extractedProgramContainer.programContainer.id);
	}
}
