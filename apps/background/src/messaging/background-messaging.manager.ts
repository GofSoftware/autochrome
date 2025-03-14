import { MessageManager } from '@autochrome/core/messaging/message-manager';
import {
	AutoMessageContentDataType,
	AutoMessageViewDataType,
	IAutoMessage, IAutoMessageContentData, IAutoMessageViewData
} from '@autochrome/core/messaging/i-auto-message';
import { ViewMessageProcessor } from './processors/view-message-processor';
import { BackgroundToPopupMessageTransporter } from './transporters/background-to-popup-message.transporter';
import { ViewInterfaceLinkFacade } from '../view-interface-link-facade';
import { RobotMessageProcessor } from './processors/robot-message-processor';
import { BackgroundToContentClientMessageTransporter } from './transporters/background-to-content-client-message.transporter';
import { RobotInterfaceLinkFacade } from '../robot-interface-link-facade';
import { BackgroundToConnectorMessageTransporter } from './transporters/background-to-connector-message.transporter';
import { concatMap, filter } from 'rxjs';
import { RobotSettingsGlobalManager } from '@autochrome/core/settings/robot-settings-global-manager';
import { Logger } from '@autochrome/core/common/logger';
import { ViewLoggerMiddleware } from './view-logger.middleware';
import { BackgroundMessagingContext } from './background-messaging.context';
import { EventDisposable } from '@autochrome/core/common/event-disposable';
import { BackgroundToContentServerMessageTransporter } from './transporters/background-to-content-server-message.transporter';

export class BackgroundMessagingManager extends EventDisposable {
	private static backgroundMessagingManagerInstance: BackgroundMessagingManager;
	public static get instance(): BackgroundMessagingManager {
		return BackgroundMessagingManager.backgroundMessagingManagerInstance ||
			(BackgroundMessagingManager.backgroundMessagingManagerInstance = new BackgroundMessagingManager());
	}

	private connectorMessageManager: MessageManager<IAutoMessageViewData> | null = null;
	private popupMessageManager: MessageManager<IAutoMessageViewData> | null = null;
	private contentMessageManager: MessageManager<IAutoMessageContentData> | null = null;

	private backgroundMessagingContext: BackgroundMessagingContext = BackgroundMessagingContext.create();
	private viewMessageProcessor = ViewMessageProcessor.create(this.backgroundMessagingContext);
	private robotMessageProcessor = RobotMessageProcessor.create(this.backgroundMessagingContext);

	public async init(): Promise<void> {
		await this.processSettings()
		this.initChromeMessaging();
		this.registerSubscription(
			this.backgroundMessagingContext.settingsChanged$.pipe(concatMap(async () => this.processSettings())).subscribe()
		);
	}

	public async processSettings(): Promise<void> {
		const settings = await RobotSettingsGlobalManager.instance.getSettings();
		await this.initConnectorMessaging().catch((error) => { Logger.instance.log(`Error in connector. ${error?.message}`)});

		const logKey = 'enableConnectorLogging';
		if (settings.enableConnectorLogging) {
			Logger.instance.middleware.set(logKey, ViewLoggerMiddleware.create());
		} else {
			Logger.instance.middleware.delete(logKey);
		}
	}

	private initChromeMessaging(): void {
		this.popupMessageManager = MessageManager.create<AutoMessageViewDataType>({
				process: async (message: IAutoMessage<AutoMessageViewDataType>) => await this.viewMessageProcessor.processMessage(message)
			},
			BackgroundToPopupMessageTransporter.create<AutoMessageViewDataType>()
		);

		this.unsubscribeAndRegisterNamed(
			this.popupMessageManager.transporter.connected$.pipe(
				filter((connected) => connected != null),
			).subscribe((connected) => {
				if (connected === true) {
					ViewInterfaceLinkFacade.instance.addMessageSender('popupMessageManager', this.popupMessageManager!);
				} else {
					ViewInterfaceLinkFacade.instance.removeMessageSender('popupMessageManager');
				}
			}),
			BackgroundToPopupMessageTransporter.name
		);

		this.contentMessageManager = MessageManager.create<AutoMessageContentDataType>({
				process: async (message: IAutoMessage<AutoMessageContentDataType>) =>
					await this.robotMessageProcessor.processMessage(message)
			},
			BackgroundToContentServerMessageTransporter.create<AutoMessageContentDataType>()
		);

		this.unsubscribeAndRegisterNamed(
			this.contentMessageManager.transporter.connected$.pipe(
				filter((connected) => connected != null),
			).subscribe((connected) => {
				if (connected === true) {
					RobotInterfaceLinkFacade.instance.addMessageSender('contentMessageManager', this.contentMessageManager!);
				} else {
					RobotInterfaceLinkFacade.instance.removeMessageSender('contentMessageManager',);
				}
			}),
            BackgroundToContentServerMessageTransporter.name
		);

        this.unsubscribeAndRegisterNamed(
            (this.contentMessageManager.transporter as BackgroundToContentServerMessageTransporter).clientConnected$.subscribe((client) => {
                if (client == null) {
                    return;
                }
                this.backgroundMessagingContext.registeredContentTabIds =
                    Array.from(
                        (this.contentMessageManager!.transporter as BackgroundToContentServerMessageTransporter).clientTransporters.values()
                    ).map((v) => (v.transporter as BackgroundToContentClientMessageTransporter).tabId.toString())
                Logger.instance.debug(
                    `BackgroundMessageManager: clientConnected "${client?.clientId}-${client?.state}" registeredTabIds: `,
                    this.backgroundMessagingContext.registeredContentTabIds
                );
                this.viewMessageProcessor.getBrowserTabs().then((tabs) => {
                    return ViewInterfaceLinkFacade.instance.sendBrowserTabList(tabs);
                }).catch((error) => { Logger.instance.log(`Error in sendBrowserTabList. ${error?.message}`) });
            }),
            BackgroundToContentClientMessageTransporter.name
        );
	}

	private async initConnectorMessaging(): Promise<void> {
		const settings = await RobotSettingsGlobalManager.instance.getSettings();
		if (!settings.enableConnector) {
			if (this.connectorMessageManager != null) {
				await this.connectorMessageManager.dispose();
				this.unsubscribe(BackgroundToConnectorMessageTransporter.name);
				this.connectorMessageManager = null;
			}
			return;
		}

		if (this.connectorMessageManager == null) {
			this.connectorMessageManager = MessageManager.create<AutoMessageViewDataType>(
				{
					process: async (message: IAutoMessage<AutoMessageViewDataType>) =>
						await this.viewMessageProcessor.processMessage(message)
				},
				BackgroundToConnectorMessageTransporter.create<AutoMessageViewDataType>(settings),
			);

			this.unsubscribeAndRegisterNamed(this.connectorMessageManager.transporter.connected$.pipe(
				filter((connected) => connected != null)
			).subscribe((connected) => {
				if (connected === true) {
					ViewInterfaceLinkFacade.instance.addMessageSender('connectorMessageManager', this.connectorMessageManager!);
				} else {
					ViewInterfaceLinkFacade.instance.removeMessageSender('connectorMessageManager');
				}
			}), BackgroundToConnectorMessageTransporter.name);
		}
	}
}
