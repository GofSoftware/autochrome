import { IAutoMessage, WebSocketLogSeverity } from '@autochrome/core/auto-link/messaging/i-auto-message';
import { AutoLinkWebSocket } from '@autochrome/core/auto-link/auto-link-web-socket';
import { Logger } from '@autochrome/core/common/logger';
import { BackgroundMessageProcessor } from './message/background-message-processor';
import { Robot, ROBOT_ACTION_TIMEOUT } from './robot/robot';
import { RobotSettingsGlobalManager } from '@autochrome/core/settings/robot-settings-global-manager';
import Alarm = chrome.alarms.Alarm;

const WATCHDOG_ALARM_NAME = 'WATCHDOG_ALARM_NAME';
const SERVER_LISTENER_ALARM = 'SERVER_LISTENER_ALARM';
const SERVER_LISTENER_ALARM_INTERVAL = 0.1;

export class Background {
	private static backgroundInstance: Background;
	public static get instance(): Background {
		return Background.backgroundInstance || (Background.backgroundInstance = new Background());
	}

	public async init(): Promise<void> {
		Logger.instance.prefix = 'Autochrome:background';
		await chrome.alarms.create(WATCHDOG_ALARM_NAME, { periodInMinutes: ROBOT_ACTION_TIMEOUT });
		await chrome.alarms.create(SERVER_LISTENER_ALARM, { periodInMinutes: SERVER_LISTENER_ALARM_INTERVAL });
        AutoLinkWebSocket.instance.logging = true;
	}

	public async alarm(alarm: Alarm): Promise<void> {
		switch (alarm.name) {
			case WATCHDOG_ALARM_NAME:
				await Robot.instance.checkActionTimeout();
				break;
			case SERVER_LISTENER_ALARM:
                const settings = await RobotSettingsGlobalManager.instance.getSettings();
                if (settings.enableConnector === true) {
                    Logger.instance.middleware = {
                        debug: (message: string, ...params: any[]) => { AutoLinkWebSocket.instance.sendLog(WebSocketLogSeverity.Debug, message, ...params); },
                        log: (message: string, ...params: any[]) => { AutoLinkWebSocket.instance.sendLog(WebSocketLogSeverity.Info, message, ...params); },
                        warn: (message: string, ...params: any[]) => { AutoLinkWebSocket.instance.sendLog(WebSocketLogSeverity.Warning, message, ...params); },
                        error: (message: string, ...params: any[]) => { AutoLinkWebSocket.instance.sendLog(WebSocketLogSeverity.Error, message, ...params); },
                    }
                    AutoLinkWebSocket.instance.refreshConnection(settings.connectorHost || 'localhost', settings.connectorPort || 3101);
                } else {
                    // If the enableConnector option has changed when the socket has already been connected
                    Logger.instance.middleware = null;
                    AutoLinkWebSocket.instance.close();
                }
				break;
		}
	}
}

chrome.alarms.onAlarm.addListener(async (alarm: Alarm) => {
	// Logger.instance.debug(`Alarm: ${alarm.name}`);
	await Background.instance.alarm(alarm);
});

chrome.runtime.onInstalled.addListener(() => {
	// chrome.contextMenus.create({
	// 	"id": "sampleContextMenu",
	// 	"title": "Sample Context Menu",
	// 	"contexts": ["selection"]
	// });
	Logger.instance.log('Installed.');
});

chrome.runtime.onMessage.addListener(
	(message: IAutoMessage, sender: chrome.runtime.MessageSender, sendResponse: (response: boolean) => void) => {
		BackgroundMessageProcessor.instance.processMessage(message, sender, sendResponse).then(/*seems should not to await here*/);
		return BackgroundMessageProcessor.instance.isKnownMessage(message);
	}
);
AutoLinkWebSocket.instance.onMessage = async (message) => {
    try {
        await BackgroundMessageProcessor.instance.processMessage(message, null, () => { /**/ })
    } catch (error) {
        Logger.instance.error('AutoLinkWebSocket Background Message processing error: ', (error as Error).message);
    }
};

Background.instance.init();
