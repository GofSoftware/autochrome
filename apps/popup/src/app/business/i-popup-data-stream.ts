import { BehaviorSubject, Subject } from 'rxjs';
import { IProgramContainerInfo } from '@autochrome/core/program/container/i-program-container';
import { IRobotSettingsGlobal } from '@autochrome/core/settings/i-robot-settings-global';
import { IAutoMessageViewDataLog } from '@autochrome/core/messaging/i-auto-message';
import Tab = chrome.tabs.Tab;

export interface IPopupDataStream {
	$programItems: BehaviorSubject<IProgramContainerInfo[]>;
	$programItemsUpdate: Subject<Partial<IProgramContainerInfo>[]>;
	$globalSettings: BehaviorSubject<IRobotSettingsGlobal | null>;
	$browserTabs: BehaviorSubject<Tab[]>;
	$log: Subject<IAutoMessageViewDataLog>;
}
