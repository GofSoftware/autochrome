import { Component, ElementRef, OnInit, signal, viewChild } from '@angular/core';
import { IAutoMessageViewDataLog } from '@autochrome/core/messaging/i-auto-message';
import { AppService } from '../../business/app.service';
import { EventDisposableComponent } from '../event-disposable.component';

@Component({
	selector: 'app-log-panel',
	standalone: true,
	templateUrl: 'log-panel.component.html',
	styleUrl: 'log-panel.component.scss'
})
export class LogPanelComponent extends EventDisposableComponent implements OnInit {
	public items = signal<IAutoMessageViewDataLog[]>([]);
	public logPanel = viewChild<ElementRef>('logPanel');

    public ngOnInit(): void {
        this.registerSubscription(AppService.instance.logUpdate$.subscribe(() => {
            this.updateLog();
        }));
        this.updateLog();
    }

    public clearLog(): void {
        AppService.instance.clearLog();
        this.items.set([]);
    }

    private updateLog(): void {
        this.items.set(AppService.instance.logItems.slice(-1000));
        setTimeout(() => {
            this.scrollBottom();
        }, 10);
    }

	private scrollBottom(): void {
		if (this.logPanel() == null) {
			return;
		}
		setTimeout(() => {
			this.logPanel()!.nativeElement.scrollTo(0, this.logPanel()!.nativeElement.scrollHeight);
		});
	}
}
