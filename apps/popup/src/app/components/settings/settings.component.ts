import { Component, OnInit, signal } from '@angular/core';
import { PopupToBackgroundLinkFacade } from '../../business/popup-to-background-link-facade';
import { AppService } from '../../business/app.service';
import { filter } from 'rxjs';
import { EventDisposableComponent } from '../event-disposable.component';
import { IRobotSettingsGlobal } from '@autochrome/core/settings/i-robot-settings-global';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Logger } from '@autochrome/core/common/logger';

@Component({
	selector: 'app-settings',
	standalone: true,
	templateUrl: './settings.component.html',
	imports: [
		ReactiveFormsModule
	],
	styleUrl: './settings.component.scss'
})
export class SettingsComponent extends EventDisposableComponent implements OnInit {

	public isLoading = signal<boolean>(false);

	public form = new FormGroup({
		autoPlay: new FormControl<boolean>(false),
		enableConnector: new FormControl<boolean>(false),
		enableConnectorLogging: new FormControl<boolean>(false),
		connectorPort: new FormControl<number>(3101, [Validators.required]),
		connectorHost: new FormControl<string>('localhost', [Validators.required, Validators.maxLength(10)]),
	})

	public async ngOnInit(): Promise<void> {
		this.registerSubscription(AppService.instance.globalSettings$
			.pipe(filter((settings) => settings != null))
			.subscribe((settings: IRobotSettingsGlobal | null) => {
				this.updateGlobalSettings(settings!);
			})
		);
	}

	public async onSave(): Promise<void> {
		this.isLoading.set(true);
		try {
			await PopupToBackgroundLinkFacade.instance.setGlobalSettings({
				autoPlay: this.form.value.autoPlay!,
				enableConnector: this.form.value.enableConnector!,
				enableConnectorLogging: this.form.value.enableConnectorLogging!,
				connectorPort: this.form.value.connectorPort!,
				connectorHost: this.form.value.connectorHost!
			});
		} catch (error: any) {
			Logger.instance.error(`setGlobalSettings error ${error?.message}`);
		} finally {
			this.isLoading.set(false);
		}
	}

	private updateGlobalSettings(settings: IRobotSettingsGlobal) {
		this.form.setValue(settings);
	}
}
