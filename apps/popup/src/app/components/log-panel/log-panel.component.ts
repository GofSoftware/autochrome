import { Component, effect, ElementRef, input, viewChild } from '@angular/core';
import { IAutoMessageViewDataLog } from '@autochrome/core/messaging/i-auto-message';

@Component({
	selector: 'app-log-panel',
	standalone: true,
	templateUrl: 'log-panel.component.html',
	styleUrl: 'log-panel.component.scss'
})
export class LogPanelComponent {
	public items = input<IAutoMessageViewDataLog[]>([]);
	public logPanel = viewChild<ElementRef>('logPanel');

	constructor() {
		effect(() => {
			if (this.items()?.length > 0) {
				this.scrollBottom();
			}
		});
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
