import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PopupToBackgroundLinkFacade } from './business/popup-to-background-link-facade';
import { Logger } from '@autochrome/core/common/logger';
import { FormsModule } from '@angular/forms';
import { ProgramItemComponent } from './components/program-item/program-item.component';
import { filter } from 'rxjs';
import { IRobotSettingsGlobal } from '@autochrome/core/settings/i-robot-settings-global';
import { EventDisposableComponent } from './components/event-disposable.component';
import { AppService } from './business/app.service';
import { IAutoMessageViewDataLog } from '@autochrome/core/messaging/i-auto-message';
import { ProgramContentComponent } from './components/program-content/program-content.component';
import { LogPanelComponent } from './components/log-panel/log-panel.component';
import { NgClass, NgIf } from '@angular/common';
import { SettingsComponent } from './components/settings/settings.component';

enum Tabs {
	ProgramContent = 'ProgramContent',
	LogPanel = 'LogPanel',
	Settings = 'Settings'
}

@Component({
  standalone: true,
	imports: [RouterModule, FormsModule, ProgramItemComponent, ProgramContentComponent, LogPanelComponent, NgIf, NgClass, SettingsComponent],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent extends EventDisposableComponent implements OnInit, OnDestroy {

	public isLoading = signal<boolean>(true);
	public logItems = signal<IAutoMessageViewDataLog[]>([]);
	public tab = signal<Tabs>(Tabs.ProgramContent);

	public Tabs = Tabs;

	public async ngOnInit(): Promise<void> {
		this.initialize();
	}

	public ngOnDestroy() {
		super.ngOnDestroy();
		AppService.instance.dispose();
	}

	public onCloseClick(): void {
		window.close();
	}

	private async initialize(): Promise<void> {
		this.isLoading.set(true);
		try {
			// await new Promise((resolve)=>{ setTimeout(resolve, 5000); });
			await AppService.instance.init();



			this.registerSubscription(AppService.instance.log$.subscribe((log: IAutoMessageViewDataLog) => {
				this.logItems().push(log)
				this.logItems.set(this.logItems().slice(-1000));
			}));

		} catch (error) {
			Logger.instance.error('Error: ', error);
		} finally {
			this.isLoading.set(false);
		}
	}
}
