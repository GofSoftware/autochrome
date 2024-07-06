import { IProgramContainer } from '../../program/container/program-container';
import { IAutoAction } from '../../program/actions/auto-action';
import { AutoActionResult } from '../../program/actions/action-types';
import { IRobotSettingsGlobal } from '../../settings/robot-settings-global';

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
	ContentProgramInterrupt = 'ContentProgramInterrupt'
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
	IAutoMessageDataContentProgramInterrupt;

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
