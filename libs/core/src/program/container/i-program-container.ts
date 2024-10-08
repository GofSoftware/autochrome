import {ProgramContainerStatus} from "@autochrome/core/program/container/program-container-status";

export interface IProgramContainer {
    id: string;
    serializedProgram: string;
    tabId: number | null;
    status: ProgramContainerStatus;
    percent: number;
    error: string | null;
    activeActionId: string | null | undefined;
    activeActionStartTime: number;
    order: number;
}
