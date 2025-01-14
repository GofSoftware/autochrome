import { ProgramContainer } from '@autochrome/core/program/container/program-container';
import { AutoStorage } from '@autochrome/core/common/auto-storage';

const CONTAINER_STORAGE_PREFIX = 'programContainer_';

export class ProgramContainerManager {
	private static programContainerManagerInstance: ProgramContainerManager;
	public static get instance(): ProgramContainerManager {
		return ProgramContainerManager.programContainerManagerInstance ||
			(ProgramContainerManager.programContainerManagerInstance = new ProgramContainerManager());
	}

	public async getAllContainers(): Promise<ProgramContainer[]> {
		const data = await AutoStorage.instance.get(null);
		return Object.keys(data).filter((key) => key.startsWith(CONTAINER_STORAGE_PREFIX)).map((key) => {
			return ProgramContainer.fromJson(data[key]);
		});
	}

	public async clear(): Promise<void> {
        const containers = await this.getAllContainers();
        await Promise.all(containers.map((container) => this.removeContainer(container.id)));
	}

	public async getContainer(id: string): Promise<ProgramContainer> {
		const foundContainer = (await this.getAllContainers()).find((container) => container.id === id);
		if (foundContainer == null) {
			throw new Error(`Container not found, id: ${id}`);
		}
		return foundContainer;
	}

	public async setContainer(programContainer: ProgramContainer): Promise<void> {
		await AutoStorage.instance.set({[`${CONTAINER_STORAGE_PREFIX}${programContainer.id}`]: programContainer.toJson()});
	}

	public async removeContainer(id: string): Promise<void> {
		await AutoStorage.instance.remove(`${CONTAINER_STORAGE_PREFIX}${id}`);
	}
}
