import { Subscription } from 'rxjs';
import { Guid } from '@autochrome/core/common/guid';

export class EventDisposable {
	protected subscriptions = new Map<string, Subscription>();

	public registerSubscription(subscription: Subscription, name = Guid.v4()): void {
		this.unsubscribe(name);
		this.subscriptions.set(name, subscription);
	}

	public unsubscribeAndRegisterNamed(subscription: Subscription, name: string): void {
		if (subscription == null) {
			throw new Error('Subscription cannot be empty.');
		}

		if (this.subscriptions.has(name)) {
			this.subscriptions.get(name)!.unsubscribe();
		}

		this.subscriptions.set(name, subscription);
	}

	public dispose(): void {
		this.subscriptions.forEach((subscription) => subscription.unsubscribe());
	}

	public unsubscribe(name: string): void {
		if (this.subscriptions.has(name)) {
			this.subscriptions.get(name)!.unsubscribe();
		}
	}
}
