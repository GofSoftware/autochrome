import {ProgramContainer} from '@autochrome/core/program/container/program-container';
import {ProgramContainerStatus} from '@autochrome/core/program/container/program-container-status';
import { ExtractedProgramContainer } from '@autochrome/core/program/container/extracted-program-container';
import { ProgramContainerManager } from './program-container-manager';
import { Logger } from '@autochrome/core/common/logger';

export class ExtractedProgramContainerManager {
	private static extractedProgramContainerManagerInstance: ExtractedProgramContainerManager;
	public static get instance(): ExtractedProgramContainerManager {
		return ExtractedProgramContainerManager.extractedProgramContainerManagerInstance ||
			(ExtractedProgramContainerManager.extractedProgramContainerManagerInstance = new ExtractedProgramContainerManager());
	}

	private cacheInstance: Map<string, ExtractedProgramContainer> | null = null;
	private cacheInstanceInitialization: Promise<Map<string, ExtractedProgramContainer>> | null = null;

	public async cache(): Promise<Map<string, ExtractedProgramContainer>> {
		if (this.cacheInstance != null) {
			return this.cacheInstance;
		}
		if(this.cacheInstanceInitialization != null) {
			return await this.cacheInstanceInitialization;
		}
		this.cacheInstanceInitialization = new Promise(async (resolve, reject) => {
			try {
				this.cacheInstance = (await ProgramContainerManager.instance.getAllContainers()).reduce((cache, container) => {
					cache.set(container.id, ExtractedProgramContainer.create(container));
					return cache;
				}, new Map<string, ExtractedProgramContainer>());
				resolve(this.cacheInstance);
			} catch (error) {
				reject(error);
			}
		});
		return await this.cacheInstanceInitialization;
	}

	public async getAllContainers(): Promise<ExtractedProgramContainer[]> {
		return Array.from((await this.cache()).values());
	}

	public async getContainer(id: string): Promise<ExtractedProgramContainer | undefined> {
		return (await this.cache()).get(id);
	}

	public async getContainersForTab(tabId: number | null): Promise<ExtractedProgramContainer[]> {
		const containers: ExtractedProgramContainer[] = [];
		(await this.cache()).forEach((container) => {
			if (container.programContainer.tabId === tabId) {
				containers.push(container);
			}
		});
		return containers.sort((a, b) => a.programContainer.order - b.programContainer.order);
	}

	public async getInProgressContainerForTab(tabId: number | null): Promise<ExtractedProgramContainer | undefined> {
		const containers: ExtractedProgramContainer[] = (await this.getContainersForTab(tabId));
		return containers.find((c) => c.programContainer.status === ProgramContainerStatus.InProgress);
	}

	public async getInProgressContainers(tabId?: number): Promise<ExtractedProgramContainer[]> {
		const containers: ExtractedProgramContainer[] = (tabId == null)
			? (await this.getAllContainers())
			: (await this.getContainersForTab(tabId));
		return containers.filter((c) => c.programContainer.status === ProgramContainerStatus.InProgress);
	}

	public async addContainer(programContainer: ProgramContainer): Promise<void> {
		const extractedProgramContainer = ExtractedProgramContainer.create(programContainer);
		// need this to store program with generated ids, we must not re-generate them every time because of activeActionId
		extractedProgramContainer.programContainer.serializedProgram = JSON.stringify(extractedProgramContainer.program.toJson());
		extractedProgramContainer.programContainer.programName = extractedProgramContainer.program.name;
		extractedProgramContainer.programContainer.programDescription = extractedProgramContainer.program.description;
		extractedProgramContainer.programContainer.totalActions = extractedProgramContainer.program.count;

		const allSortedContainers = (await this.getAllContainers()).sort((a, b) => a.programContainer.order - b.programContainer.order);
		if (allSortedContainers.length > 0) {
			const newOrder = allSortedContainers[allSortedContainers.length - 1].programContainer.order + 1;
			programContainer.order = newOrder;
		}

		await ExtractedProgramContainerManager.instance.setContainer(extractedProgramContainer);
	}

	public async clearAll(): Promise<void> {
		await ProgramContainerManager.instance.clear();
		(await this.cache()).clear();
	}

	public async setContainer(extractedProgramContainer: ExtractedProgramContainer): Promise<void> {
		await ProgramContainerManager.instance.setContainer(extractedProgramContainer.programContainer);
		(await this.cache()).set(extractedProgramContainer.programContainer.id, extractedProgramContainer);
	}

	public async removeContainer(id: string): Promise<void> {
		await ProgramContainerManager.instance.removeContainer(id);
		(await this.cache()).delete(id);
	}

	public async getNextContainerForTab(startFrom: ExtractedProgramContainer): Promise<ExtractedProgramContainer | undefined> {
		const relatedContainers = await this.getContainersForTab(startFrom.programContainer.tabId);
		Logger.instance.log(`${relatedContainers.length} containers have been found for the Tab Id ${startFrom.programContainer.tabId}`);
		return relatedContainers.find((container) => container.programContainer.order > startFrom.programContainer.order);
	}
}
