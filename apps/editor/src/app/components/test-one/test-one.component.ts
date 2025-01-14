import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';

interface IItem {
	id: number;
	name: string;
}

@Component({
	selector: 'app-test-one',
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: 'test-one.component.html'
})
export class TestOneComponent {
	// public items: IItem[] = [];
	public items = signal<IItem[]>([]);

	public generateItems(itemsNumber: number): void {
		const result: IItem[] = [];
		const date = Date.now();
		for (let i = 0; i < 10000000; i++) {
			if (i%itemsNumber === 0)
			result.push({id: i/itemsNumber, name: `[${date}] Item #${i/itemsNumber}`});
		}
		// this.items = result;
		this.items.set(result);
	}
}
