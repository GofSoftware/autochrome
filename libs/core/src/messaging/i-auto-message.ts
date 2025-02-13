import { IRobotSettingsGlobal } from '../settings/i-robot-settings-global';
import { IAutoAction } from "../program/actions/types/i-auto-action";
import { AutoActionResult } from "../program/actions/types/auto-action-result";
import { IProgramContainerInfo } from '../program/container/i-program-container';
import { LogSeverity } from '@autochrome/core/common/i-logger';

export enum AutoMessageType {
	Ping = 'Ping',
	CompleteProgramListUpdate = 'CompleteProgramListUpdate',
	ContainerClearAll = 'ContainerClearAll',
	ContainerNew = 'ContainerNew',
	SeveralContainersUpdate = 'SeveralContainersUpdate',
	ContainerRemove = 'ContainerRemove',
	ContainerAction = 'ContainerAction',
	SetGlobalSettings = 'SetGlobalSettings',
	GlobalSettings = 'GlobalSettings',
	GetGlobalSettings = 'GetGlobalSettings',
	GetProgramList = 'GetProgramList',
	Log = 'Log',
	GetBrowserTabList = 'GetBrowserTabList',
	BrowserTabList = 'BrowserTabList',
	CloseBrowserTab = 'CloseBrowserTab',

	ContentProgramAction = 'ContentProgramAction',
	ContentProgramActionResult = 'ContentProgramActionResult',
	ContentProgramInterrupt = 'ContentProgramInterrupt',
	ContentAwake = 'ContentAwake',

	AsyncMessageClientConnect = 'AsyncMessageClientConnect',
    AsyncMessageResult = 'AsyncMessageResult',
}

export interface IAutoMessageData<T extends AutoMessageType = AutoMessageType> {
	type: T
}

export interface IAutoMessageAsyncMessageResult extends IAutoMessageData<AutoMessageType.AsyncMessageResult> {
	originalMessageId: string;
	ok: boolean;
	result?: any;
	error?: any;
}

export interface IAutoMessageAsyncMessageClientConnect extends IAutoMessageData<AutoMessageType.AsyncMessageClientConnect> {
}

export interface IAutoMessageViewData<T extends AutoMessageType = AutoMessageType> extends IAutoMessageData<T> {}

export interface IAutoMessageViewDataProgramListUpdate extends IAutoMessageViewData<AutoMessageType.CompleteProgramListUpdate> {
	programContainers: IProgramContainerInfo[]
}

export interface IAutoMessageViewDataGetProgramList extends IAutoMessageViewData<AutoMessageType.GetProgramList> {
}

export interface IAutoMessageViewDataSeveralContainersUpdate extends IAutoMessageViewData<AutoMessageType.SeveralContainersUpdate>  {
	containerInfos: Partial<IProgramContainerInfo>[];
}

export interface IAutoMessageViewDataNewContainer extends IAutoMessageViewData<AutoMessageType.ContainerNew> {
	container: string;
	tabId: number | null;
}

export interface IAutoMessageViewDataRemoveContainer extends IAutoMessageViewData<AutoMessageType.ContainerRemove> {
	containerId: string;
}

export interface IAutoMessageViewDataClearAllContainers extends IAutoMessageViewData<AutoMessageType.ContainerClearAll> {
}

export enum ProgramContainerAction {
	Play = 'Play',
	Stop = 'Stop',
	Pause = 'Pause'
}

export interface IAutoMessageViewDataContainerAction extends IAutoMessageViewData<AutoMessageType.ContainerAction> {
	containerId: string | null;
	action: ProgramContainerAction;
}

export interface IAutoMessageViewDataSetGlobalSettings extends IAutoMessageViewData<AutoMessageType.SetGlobalSettings> {
	globalSettings: Partial<IRobotSettingsGlobal>;
}

export interface IAutoMessageViewDataGlobalSettings extends IAutoMessageViewData<AutoMessageType.GlobalSettings> {
	globalSettings: IRobotSettingsGlobal;
}

export interface IAutoMessageViewDataGetGlobalSettings extends IAutoMessageViewData<AutoMessageType.GetGlobalSettings> {
}

export interface IAutoMessageViewDataLog extends IAutoMessageViewData<AutoMessageType.Log>  {
	message: string;
	severity: LogSeverity;
}

export interface IBrowserTab {
	id: number;
	title: string;
	url: string;
    active: boolean
}

export interface IAutoMessageViewDataBrowserTabList extends IAutoMessageViewData<AutoMessageType.BrowserTabList> {
    browserTabs: IBrowserTab[];
}

export interface IAutoMessageViewDataGetBrowserTabList extends IAutoMessageViewData<AutoMessageType.GetBrowserTabList>  {
}

export interface IAutoMessageViewDataCloseBrowserTab extends IAutoMessageViewData<AutoMessageType.CloseBrowserTab>  {
	tabId: number | null;
	tabUrlOrTitle: string | null;
}

export interface IAutoMessageContentData<T extends AutoMessageType = AutoMessageType> extends IAutoMessageData<T> {
	tabId?: number;
}

export interface IAutoMessageContentDataProgramAction extends IAutoMessageContentData<AutoMessageType.ContentProgramAction> {
	action: IAutoAction;
}

export interface IAutoMessageContentDataProgramActionResult extends IAutoMessageContentData<AutoMessageType.ContentProgramActionResult> {
	actionId: string;
	result: AutoActionResult;
	resultValue: any;
	error?: string;
}

export interface IAutoMessageContentDataProgramInterrupt extends IAutoMessageContentData<AutoMessageType.ContentProgramInterrupt> {
	reason: string;
}

export interface IAutoMessageContentDataAwake extends IAutoMessageContentData<AutoMessageType.ContentAwake> {
}

export interface IAutoMessageContentDataPing extends IAutoMessageContentData<AutoMessageType.Ping> {
	reason: string;
}

export type AutoMessageViewDataType =
	IAutoMessageViewDataProgramListUpdate |
	IAutoMessageViewDataSeveralContainersUpdate |
	IAutoMessageViewDataLog |
	IAutoMessageViewDataGlobalSettings |
	IAutoMessageViewDataNewContainer |
	IAutoMessageViewDataRemoveContainer |
	IAutoMessageViewDataClearAllContainers |
	IAutoMessageViewDataContainerAction |
	IAutoMessageViewDataSetGlobalSettings |
	IAutoMessageAsyncMessageResult |
	IAutoMessageViewDataGetGlobalSettings |
	IAutoMessageViewDataGetProgramList |
	IAutoMessageAsyncMessageClientConnect |
	IAutoMessageViewDataGetBrowserTabList |
	IAutoMessageViewDataCloseBrowserTab |
    IAutoMessageViewDataBrowserTabList;

export type AutoMessageContentDataType =
	IAutoMessageContentDataProgramAction |
	IAutoMessageContentDataProgramActionResult |
	IAutoMessageContentDataProgramInterrupt |
	IAutoMessageAsyncMessageClientConnect |
	IAutoMessageContentDataPing |
	IAutoMessageContentDataAwake;

// export type AutoMessageAllDataTypes = AutoMessageViewDataType | AutoMessageContentDataType;

export interface IAutoMessage<T> {
	id: string;
	clientId: string;
	noResponse: boolean;
	data: T;
}
