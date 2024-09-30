import { Component, computed, effect, input, OnDestroy, signal, untracked } from '@angular/core';
import { ProgramItem } from '../../program/program-item';
import { TabManager } from '@autochrome/core/common/tab-manager';
import { ProgramContainerStatus } from '@autochrome/core/program/container/program-container-status';
import { AutoLinkClient } from '@autochrome/core/auto-link/auto-link-client';
import { ProgramContainerAction } from '@autochrome/core/auto-link/messaging/i-auto-message';
import { NgClass, NgIf, NgStyle } from '@angular/common';
import { Subscription } from 'rxjs';

interface IElementsVisibility {
	playVisible?: boolean;
	playDisabled?: boolean;
	pauseVisible?: boolean;
	pauseDisabled?: boolean;
	stopVisible?: boolean;
	stopDisabled?: boolean;
}

@Component({
	standalone: true,
	selector: 'app-program-item',
	templateUrl: 'program-item.component.html',
	imports: [
		NgIf,
		NgClass,
		NgStyle
	],
	styleUrl: 'program-item.component.scss'
})
export class ProgramItemComponent implements OnDestroy {
	public item = input.required<ProgramItem>();

	public isSelected = signal<boolean>(false);
	public visibility = signal<IElementsVisibility>({});
	public tabExists = signal<boolean>(false);
	public tabTitle = signal<string>('');
	public actionIndex = signal<number>(0);
	public count = signal<number>(0);
	public progressBarValue = signal<number>(0);
	public isActive = computed<boolean>(() => this.isProgressBarVisible() || this.isSelected());
	public isSuccess = signal<boolean>(false);
	public hasError = signal<boolean>(false);

	private itemChangeSubscription: Subscription;

	constructor() {
		effect(() => {
			if(this.item() != null) {
				if (this.itemChangeSubscription) {
					this.itemChangeSubscription.unsubscribe();
				}
				this.itemChangeSubscription = this.item().itemChanged$.subscribe(() => {
					untracked(() => {
						this.update();
					});
				});
				untracked(() => {
					this.update();
				});
			}
		});
	}

	public ngOnDestroy(): void {
		if (this.itemChangeSubscription) {
			this.itemChangeSubscription.unsubscribe();
		}
	}

	public async onCloseButtonClick() {
		await AutoLinkClient.instance().removeContainer(this.item().extractedProgramContainer.programContainer.id);
	}

	public async onPlayButtonClick() {
		await AutoLinkClient.instance().doContainerAction(
			this.item().extractedProgramContainer.programContainer.id, ProgramContainerAction.Play
		);
	}

	public async onStopButtonClick() {
		await AutoLinkClient.instance().doContainerAction(
			this.item().extractedProgramContainer.programContainer.id, ProgramContainerAction.Stop
		);
	}

	public async onPauseButtonClick() {
		await AutoLinkClient.instance().doContainerAction(
			this.item().extractedProgramContainer.programContainer.id, ProgramContainerAction.Pause
		);
	}

	public async onExpandButtonClick() {
		this.isSelected.set(!this.isSelected());
	}

	public async onSetCurrentTabClick() {
		const [currentTab] = await chrome.tabs.query( { active: true });
		if (currentTab != null) {
			this.item().extractedProgramContainer.programContainer.tabId = currentTab.id;
			await AutoLinkClient.instance().updateContainer(this.item().extractedProgramContainer.programContainer);
		}
	}

	private update(): void {
		this.visibility.set(this.calcElementsVisibility());

		this.tabExists.set(TabManager.instance.exists(this.item().extractedProgramContainer.programContainer.tabId));
		this.tabTitle.set(
			this.tabExists()
				? TabManager.instance.tab(this.item().extractedProgramContainer.programContainer.tabId).title
				: 'Tab is closed, click to set current tab.'
		);

		this.actionIndex.set(this.item().extractedProgramContainer.activeAction?.index || 0);
		this.count.set(this.item().extractedProgramContainer.program.count);
		this.progressBarValue.set(this.count() === 0 ? 0 : (100 * this.actionIndex() / this.count()));

		this.isSuccess.set(this.item().extractedProgramContainer.programContainer.status === ProgramContainerStatus.Completed);
		this.hasError.set(this.item().extractedProgramContainer.programContainer.error != null);
	}

	private calcElementsVisibility(): IElementsVisibility {
		return {
			playVisible: true,
			playDisabled: this.item().extractedProgramContainer.programContainer.status === ProgramContainerStatus.InProgress,
			pauseVisible: true,
			pauseDisabled: this.item().extractedProgramContainer.programContainer.status === ProgramContainerStatus.Paused ||
				this.item().extractedProgramContainer.programContainer.status === ProgramContainerStatus.Stopped ||
				this.item().extractedProgramContainer.programContainer.status === ProgramContainerStatus.Ready ||
				this.item().extractedProgramContainer.programContainer.status === ProgramContainerStatus.Error ||
				this.item().extractedProgramContainer.programContainer.status === ProgramContainerStatus.Completed,
			stopVisible: true,
			stopDisabled: this.item().extractedProgramContainer.programContainer.status === ProgramContainerStatus.Stopped ||
				this.item().extractedProgramContainer.programContainer.status === ProgramContainerStatus.Ready ||
				this.item().extractedProgramContainer.programContainer.status === ProgramContainerStatus.Error ||
				this.item().extractedProgramContainer.programContainer.status === ProgramContainerStatus.Completed
		};
	}

	private isProgressBarVisible(): boolean {
		return this.item().extractedProgramContainer.programContainer.status === ProgramContainerStatus.Paused ||
			this.item().extractedProgramContainer.programContainer.status === ProgramContainerStatus.InProgress;
	}
}

