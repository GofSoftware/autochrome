import {ProgramContainerStatus} from "@autochrome/core/program/container/program-container-status";

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
