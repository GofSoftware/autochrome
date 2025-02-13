import { Subject } from 'rxjs';
import { IRobotSettingsGlobal } from '@autochrome/core/settings/i-robot-settings-global';

export class BackgroundMessagingContext {
	public static create(): BackgroundMessagingContext {
		return new BackgroundMessagingContext();
	}

	private $settingsChanged = new Subject<Partial<IRobotSettingsGlobal>>();
	public settingsChanged$ = this.$settingsChanged.asObservable();
	public registeredContentTabIds: string[] = [];

	public notifySettingsChanged(settings: Partial<IRobotSettingsGlobal>): void {
		this.$settingsChanged.next(settings);
	}
}
