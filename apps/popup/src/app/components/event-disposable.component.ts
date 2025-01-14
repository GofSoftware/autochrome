import { Component, OnDestroy } from '@angular/core';
import { EventDisposable } from '@autochrome/core/common/event-disposable';

@Component({
	template: '',
	standalone: true
})
export class EventDisposableComponent extends EventDisposable implements OnDestroy {
	public ngOnDestroy() {
		this.dispose();
	}
}
