import { IRobotSettingsGlobal } from '../../settings/i-robot-settings-global';
import { IAutoAction } from "../../program/actions/types/i-auto-action";
import { AutoActionResult } from "../../program/actions/types/auto-action-result";
import { IProgramContainer } from "../../program/container/i-program-container";

export enum AutoMessageType {
	Ping = 'Ping',
	ContainerNew = 'ContainerNew',
	ContainerUpdate = 'ContainerUpdate',
	ContainerRemove = 'ContainerRemove',
	ContainerAction = 'ContainerAction',
	SetGlobalSettings = 'SetGlobalSettings',

	ContentAwake = 'ContentAwake',
	ContentProgramAction = 'ContentProgramAction',
	ContentProgramActionResult = 'ContentProgramActionResult',
	ContentProgramInterrupt = 'ContentProgramInterrupt',

    WebSocketConnect = 'WebSocketConnect',
}

export type IAutoMessageDataType =
	IAutoMessageDataContainerChanged |
	IAutoMessageDataNewContainer |
	IAutoMessageDataRemoveContainer |
	IAutoMessageDataContainerAction |
	IAutoMessageDataSetGlobalSettings |

	IAutoMessageDataContentAwake |
	IAutoMessageDataContentProgramAction |
	IAutoMessageDataContentProgramActionResult |
	IAutoMessageDataContentProgramInterrupt |
	IAutoMessageWebSocketConnect;

export interface IAutoMessage<T extends IAutoMessageDataType = IAutoMessageDataType> {
	type: AutoMessageType;
	data: T;
}

export enum IAutoMessageContainerChangeType {
	New = 'New',
	Update = 'Update',
	Remove = 'Remove',
}

export interface IAutoMessageDataContainerChanged {
	containerId: string;
	type: IAutoMessageContainerChangeType;
}

export interface IAutoMessageDataUpdateContainer {
	container: IProgramContainer;
}

export interface IAutoMessageDataNewContainer {
	container: IProgramContainer;
}

export interface IAutoMessageDataRemoveContainer {
	containerId: string;
}

export enum ProgramContainerAction {
	Play = 'Play',
	Stop = 'Stop',
	Pause = 'Pause'
}

export interface IAutoMessageDataContainerAction {
	containerId: string;
	action: ProgramContainerAction;
}

export interface IAutoMessageDataContentAwake {
	now: number;
}

export interface IAutoMessageDataContentProgramAction {
	action: IAutoAction;
}

export interface IAutoMessageDataContentProgramActionResult {
	actionId: string;
	result: AutoActionResult;
	resultValue: any;
	error?: string;
}

export interface IAutoMessageDataContentProgramInterrupt {
	reason: string;
}

export interface IAutoMessageDataSetGlobalSettings {
	globalSettings: Partial<IRobotSettingsGlobal>;
}

export interface IAutoMessageWebSocketConnect {
	clientId: string;
}
