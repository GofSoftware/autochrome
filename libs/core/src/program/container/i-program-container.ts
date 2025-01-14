import {ProgramContainerStatus} from "@autochrome/core/program/container/program-container-status";

export interface IProgramContainerInfo {
    id: string;
    tabId: number | null;
    status: ProgramContainerStatus;
    percent: number;
    error: string | null;
    activeActionId: string | null | undefined;
    activeActionStartTime: number;
    order: number;
	programName: string;
	programDescription: string;
	activeActionName: string;
	activeActionDescription: string;
	totalActions: number;
	activeActionIndex: number;
}

export interface IProgramContainer extends IProgramContainerInfo {
	serializedProgram: string;
}

