import { IAutoMessage } from '@autochrome/core/auto-link/messaging/i-auto-message';
import { Logger } from '@autochrome/core/common/logger';
import { BackgroundMessageProcessor } from './message/background-message-processor';
import Alarm = chrome.alarms.Alarm;
import { Robot, ROBOT_ACTION_TIMEOUT } from './robot/robot';

const WATCHDOG_ALARM_NAME = 'WATCHDOG_ALARM_NAME';

export class Background {
	private static backgroundInstance: Background;
	public static get instance(): Background {
		return Background.backgroundInstance || (Background.backgroundInstance = new Background());
	}

	public async init(): Promise<void> {
		Logger.instance.prefix = 'Autochrome:background';
		await chrome.alarms.create(WATCHDOG_ALARM_NAME, { periodInMinutes: ROBOT_ACTION_TIMEOUT });
	}

	public async alarm(alarm: Alarm): Promise<void> {
		switch (alarm.name) {
			case WATCHDOG_ALARM_NAME:
				await Robot.instance.checkActionTimeout();
				break;
		}
	}
}

chrome.alarms.onAlarm.addListener(async (alarm: Alarm) => {
	Logger.instance.debug(`Alarm: ${alarm.name}`);
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


Background.instance.init();
