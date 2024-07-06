import { ProgramContainer } from '../program/container/program-container';
import { AutoStorage } from '../common/auto-storage';

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

	public async getContainer(id: string): Promise<ProgramContainer> {
		return (await this.getAllContainers()).find((container) => container.id === id);
	}

	public async setContainer(programContainer: ProgramContainer): Promise<void> {
		await AutoStorage.instance.set({[`${CONTAINER_STORAGE_PREFIX}${programContainer.id}`]: programContainer.toJson()});
	}

	public async removeContainer(id: string): Promise<void> {
		await AutoStorage.instance.remove(`${CONTAINER_STORAGE_PREFIX}${id}`);
	}
}
