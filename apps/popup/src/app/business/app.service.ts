import { Logger } from '@autochrome/core/common/logger';
import { PopupMessageProcessor } from './messaging/popup-message.processor';
import { IProgramContainerInfo } from '@autochrome/core/program/container/i-program-container';
import { BehaviorSubject, filter, Observable, Subject, switchMap } from 'rxjs';
import { MessageManager } from '@autochrome/core/messaging/message-manager';
import { PopupToBackgroundMessageTransporter } from './messaging/popup-to-background-message.transporter';
import { PopupToBackgroundLinkFacade } from './popup-to-background-link-facade';
import { IRobotSettingsGlobal } from '@autochrome/core/settings/i-robot-settings-global';
import {
    AutoMessageType,
    AutoMessageViewDataType,
    IAutoMessageViewDataLog, IBrowserTab
} from '@autochrome/core/messaging/i-auto-message';
import Tab = chrome.tabs.Tab;
import { EventDisposable } from '@autochrome/core/common/event-disposable';
import { IPopupDataStream } from './i-popup-data-stream';
import { LogSeverity } from '@autochrome/core/common/i-logger';

export class AppService extends EventDisposable {
	private static appServiceInstance: AppService;
	public static get instance(): AppService {
		return AppService.appServiceInstance || (AppService.appServiceInstance = new AppService());
	}

	public messageManager: MessageManager<AutoMessageViewDataType> | null = null;

	private $programItems = new BehaviorSubject<IProgramContainerInfo[]>([]);
	public programItems$: Observable<IProgramContainerInfo[]> = this.$programItems.asObservable();

	private $programItemsUpdate = new Subject<Partial<IProgramContainerInfo>[]>();
	public programItemsUpdate$: Observable<Partial<IProgramContainerInfo>[]> = this.$programItemsUpdate.asObservable();

    private $globalSettings = new BehaviorSubject<IRobotSettingsGlobal | null>(null);
	public globalSettings$: Observable<IRobotSettingsGlobal | null> = this.$globalSettings.asObservable();

    private $browserTabs = new BehaviorSubject<IBrowserTab[]>([]);
	public browserTabs$: Observable<IBrowserTab[]> = this.$browserTabs.asObservable();

    private $log = new Subject<IAutoMessageViewDataLog>();
	public log$: Observable<IAutoMessageViewDataLog> = this.$log.asObservable();

	public async init(): Promise<void> {
		Logger.instance.prefix = 'Autochrome:popup';

		const dataStream: IPopupDataStream = {
			$programItems: this.$programItems,
			$programItemsUpdate: this.$programItemsUpdate,
			$globalSettings: this.$globalSettings,
			$browserTabs: this.$browserTabs,
			$log: this.$log
		};

		this.messageManager = MessageManager.create<AutoMessageViewDataType>(
			PopupMessageProcessor.create(dataStream),
			PopupToBackgroundMessageTransporter.create<AutoMessageViewDataType>()
		);

		PopupToBackgroundLinkFacade.instance.init(this.messageManager);

		this.unsubscribeAndRegisterNamed(
			this.messageManager.transporter.connected$.pipe(
				filter((connected: boolean | null) => {
					return connected != null;
				}),
				switchMap(async (connected) => {
					if (connected) {
						const [settings, programList, browserTabs] = await Promise.all([
							await PopupToBackgroundLinkFacade.instance.getGlobalSettings(),
							await PopupToBackgroundLinkFacade.instance.getProgramList(),
							await PopupToBackgroundLinkFacade.instance.getBrowserTabs()
						]);
						dataStream.$globalSettings.next(settings);
						dataStream.$programItems.next(programList);
						dataStream.$browserTabs.next(browserTabs);
					}
				})
			).subscribe(),
			'messageManager.transporter.connected$'
		);

		Logger.instance.middleware.set('Autochrome:popup log stream',{
			debug: (message: string, ...params) => { this.$log.next({type: AutoMessageType.Log, message, severity: LogSeverity.debug}); },
			log: (message: string, ...params) => { this.$log.next({type: AutoMessageType.Log, message, severity: LogSeverity.log}); },
			warn: (message: string, ...params) => { this.$log.next({type: AutoMessageType.Log, message, severity: LogSeverity.warn}); },
			error: (message: string, ...params) => { this.$log.next({type: AutoMessageType.Log, message, severity: LogSeverity.error}); },
		});
	}
}
