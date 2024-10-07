import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IAutoActionClick } from '@autochrome/core/program/actions/auto-action-click';
import { IAutoActionProcedure } from '@autochrome/core/program/actions/auto-action-procedure';
import { AutoActionSchema } from './auto-action-zod-schema';

@Component({
	standalone: true,
	imports: [RouterModule],
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrl: './app.component.sass'
})
export class AppComponent implements OnInit {
	public ngOnInit() {
		const actionData = {
			id: 'root-id',
			name: 'AutoActionClick',
			description: 'Test',
			selector: '#test-anchor',
			smoothMouse: false,
			children: [
				{
					name: 'AutoActionProcedure',
					procedureName: 'Test Procedure'
				} as IAutoActionProcedure
			]
		} as IAutoActionClick;

		const parsed = AutoActionSchema.safeParse(actionData);

		console.log(parsed);
	}
}
