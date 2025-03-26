import { Guid } from '../../common/guid';
import { IProgramContainer, IProgramContainerInfo } from './i-program-container';
import {ProgramContainerStatus} from "./program-container-status";

export class ProgramContainer implements IProgramContainer {

	public static create(serializedProgram: string, tabId: number | null): ProgramContainer {
		return new ProgramContainer(
			Guid.v4(), serializedProgram, tabId, ProgramContainerStatus.New, 0, null, null, 0, 0, '', '', '', '', 0, 0, false
		);
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
			programContainer.order,
			programContainer.programName,
			programContainer.programDescription,
			programContainer.activeActionName,
			programContainer.activeActionDescription,
			programContainer.totalActions,
			programContainer.activeActionIndex,
			programContainer.excluded
		);
	}

	protected constructor(
		public id: string,
		public serializedProgram: string,
		public tabId: number | null,
		public status: ProgramContainerStatus,
		public percent: number,
		public error: string | null,
		public activeActionId: string | null | undefined,
		public activeActionStartTime: number,
		public order: number,
		public programName: string,
		public programDescription: string,
		public activeActionName: string,
		public activeActionDescription: string,
		public totalActions: number,
		public activeActionIndex: number,
		public excluded: boolean
	) {
	}

	public toJson(): IProgramContainer {
		const info = this.toInfo() as IProgramContainer;
		info.serializedProgram = this.serializedProgram;
		return info;
	}

	public toInfo(): IProgramContainerInfo {
		return {
			id: this.id,
			tabId: this.tabId,
			status: this.status,
			percent: this.percent,
			error: this.error,
			activeActionId: this.activeActionId,
			activeActionStartTime: this.activeActionStartTime,
			order: this.order,
			programName: this.programName,
			programDescription: this.programDescription,
			activeActionName: this.activeActionName,
			activeActionDescription: this.activeActionDescription,
			totalActions: this.totalActions,
			activeActionIndex: this.activeActionIndex,
			excluded: this.excluded
		};
	}
}
