import { Component, computed, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Logger } from '@autochrome/core/common/logger';
import { FormsModule } from '@angular/forms';
import { ProgramItemComponent } from './components/program-item/program-item.component';
import { EventDisposableComponent } from './components/event-disposable.component';
import { AppService } from './business/app.service';
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
	public tab = signal<Tabs>(Tabs.ProgramContent);
	public connected = signal<boolean>(false);
	public connectionTitle = computed<string>(() => this.connected() ? 'Connected' : 'Disconnected');

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
      this.unsubscribeAndRegisterNamed(AppService.instance.connected$.subscribe((connected: boolean) => {
        this.connected.set(connected);
      }), 'AppService.instance.connected$');
		} catch (error) {
			Logger.instance.error('Error: ', error);
		} finally {
			this.isLoading.set(false);
		}
	}
}
