import { Logger } from '@autochrome/core/common/logger';
import { Robot, ROBOT_ACTION_TIMEOUT } from './robot/robot';
import { BackgroundMessagingManager } from './messaging/background-messaging.manager';
import { LogSeverity } from '@autochrome/core/common/i-logger';
import Alarm = chrome.alarms.Alarm;

const WATCHDOG_ALARM_NAME = 'WATCHDOG_ALARM_NAME';

export class Background {
	private static backgroundInstance: Background;
	public static get instance(): Background {
		return Background.backgroundInstance || (Background.backgroundInstance = new Background());
	}

	public async init(): Promise<void> {
		Logger.instance.prefix = 'Autochrome:background';
		Logger.instance.severity = LogSeverity.debug;
		await chrome.alarms.create(WATCHDOG_ALARM_NAME, { periodInMinutes: ROBOT_ACTION_TIMEOUT });
		// await chrome.alarms.create(SERVER_LISTENER_ALARM, { periodInMinutes: SERVER_LISTENER_ALARM_INTERVAL });

		await BackgroundMessagingManager.instance.init();

        this.initAlarms();
	}

	public async alarm(alarm: Alarm): Promise<void> {
		switch (alarm.name) {
			case WATCHDOG_ALARM_NAME:
				await Robot.instance.checkActionTimeout();
				break;
		}
	}

	private initAlarms(): void {
		chrome.alarms.onAlarm.addListener(async (alarm: Alarm) => {
			// Logger.instance.debug(`Alarm: ${alarm.name}`);
			await Background.instance.alarm(alarm);
		});
	}
}

chrome.runtime.onInstalled.addListener(() => {
	Logger.instance.log('Installed.');
});

(async () => await Background.instance.init())();
