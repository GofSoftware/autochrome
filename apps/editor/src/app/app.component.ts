import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TestOneComponent } from './components/test-one/test-one.component';

@Component({
  standalone: true,
	imports: [RouterModule, TestOneComponent],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.sass',
})
export class AppComponent implements OnInit {
	public tick = 0;
	ngOnInit(): void {
		setInterval(() => {
			this.setTick();
		}, 1000)
	}

	private setTick(): void {
		this.tick = Date.now();
		let a = 0;
		for(let i = 0; i < 10000000; i++) {
			a += 1;
		}
		console.log(this.tick, a);
	}
}
