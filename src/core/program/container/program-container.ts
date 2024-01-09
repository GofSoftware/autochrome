import { Guid } from '../../common/guid';

export enum ProgramContainerStatus {
	Ready = 'Ready',
	InProgress = 'InProgress',
	Paused = 'Paused',
	Stopped = 'Stopped',
	Completed = 'Completed',
	Error = 'Error'
}

export interface IProgramContainer {
	id: string;
	serializedProgram: string;
	tabId: number;
	status: ProgramContainerStatus;
	percent: number;
	error: string;
	activeActionId: string;
	activeActionStartTime: number;
	order: number;
}

export class ProgramContainer implements IProgramContainer {

	public static create(serializedProgram: string, tabId: number): ProgramContainer {
		return new ProgramContainer(Guid.v4(), serializedProgram, tabId, ProgramContainerStatus.Ready, 0, null, null, 0, 0);
	}

	public static fromJson(programContainer: IProgramContainer) {
		return new ProgramContainer(
			programContainer.id,
			programContainer.serializedProgram,
			programContainer.tabId,
			programContainer.status,
			programContainer.percent,
			programContainer.error,
			programContainer.activeActionId,
			programContainer.activeActionStartTime,
			programContainer.order
		);
	}

	protected constructor(
		public id: string,
		public serializedProgram: string,
		public tabId: number,
		public status: ProgramContainerStatus,
		public percent: number,
		public error: string,
		public activeActionId: string,
		public activeActionStartTime: number,
		public order: number
	) {
	}

	public toJson(): IProgramContainer {
		return {
			id: this.id,
			serializedProgram: this.serializedProgram,
			tabId: this.tabId,
			status: this.status,
			percent: this.percent,
			error: this.error,
			activeActionId: this.activeActionId,
			activeActionStartTime: this.activeActionStartTime,
			order: this.order
		};
	}
}
