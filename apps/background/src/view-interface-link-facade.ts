import {
    AutoMessageType,
    IAutoMessageViewDataSeveralContainersUpdate,
    IAutoMessageViewDataGlobalSettings,
    IAutoMessageViewDataLog,
    IAutoMessageViewDataProgramListUpdate, IBrowserTab, IAutoMessageViewDataBrowserTabList
} from '@autochrome/core/messaging/i-auto-message';
import { IProgramContainerInfo } from '@autochrome/core/program/container/i-program-container';
import { BaseLinkFacade } from '@autochrome/core/auto-link/base-link-facade';
import { IRobotSettingsGlobal } from '@autochrome/core/settings/i-robot-settings-global';
import { LogSeverity } from '@autochrome/core/common/i-logger';

export class ViewInterfaceLinkFacade extends BaseLinkFacade {
	private static viewInterfaceLinkFacadeInstance: ViewInterfaceLinkFacade;
	public static get instance(): ViewInterfaceLinkFacade {
		return ViewInterfaceLinkFacade.viewInterfaceLinkFacadeInstance ||
			(ViewInterfaceLinkFacade.viewInterfaceLinkFacadeInstance = new ViewInterfaceLinkFacade());
	}

    public async sendProgramListUpdate(programContainers: IProgramContainerInfo[]): Promise<void> {
		const data: IAutoMessageViewDataProgramListUpdate = {type: AutoMessageType.CompleteProgramListUpdate, programContainers};
		await this.sendToAll(data, true, null);
    }

	public async sendProgramContainersUpdate(programContainers: IProgramContainerInfo[]): Promise<void> {
		const data: IAutoMessageViewDataSeveralContainersUpdate = {type: AutoMessageType.SeveralContainersUpdate, containerInfos: programContainers};
		await this.sendToAll(data, true, null);
	}

    public sendLog(message: string, severity: LogSeverity): void {
		const data: IAutoMessageViewDataLog = {type: AutoMessageType.Log, message, severity};
		this.sendToAll(data, true, null).then(/*noWait === true*/);
    }

    public async sendRobotSettings(globalSettings: IRobotSettingsGlobal): Promise<void> {
		const data: IAutoMessageViewDataGlobalSettings = {type: AutoMessageType.GlobalSettings, globalSettings};
		await this.sendToAll(data, true, null);
    }

    public async sendBrowserTabList(browserTabs: IBrowserTab[]): Promise<void> {
		const data: IAutoMessageViewDataBrowserTabList = {type: AutoMessageType.BrowserTabList, browserTabs};
		await this.sendToAll(data, true, null);
    }
}
