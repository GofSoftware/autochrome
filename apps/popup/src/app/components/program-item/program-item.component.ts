import { Component, effect, input, OnDestroy, signal, untracked } from '@angular/core';
import { TabManager } from '@autochrome/core/common/tab-manager';
import { ProgramContainerStatus } from '@autochrome/core/program/container/program-container-status';
import { PopupToBackgroundLinkFacade } from '../../business/popup-to-background-link-facade';
import { ProgramContainerAction } from '@autochrome/core/messaging/i-auto-message';
import { NgClass, NgIf, NgStyle } from '@angular/common';
import { Subscription } from 'rxjs';
import { IProgramContainerInfo } from '@autochrome/core/program/container/i-program-container';

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
	public item = input.required<IProgramContainerInfo>();

	public isSelected = signal<boolean>(false);
	public visibility = signal<IElementsVisibility>({});
	public tabExists = signal<boolean>(false);
	public tabTitle = signal<string>('');
	public actionIndex = signal<number>(0);
	public count = signal<number>(0);
	public progressBarValue = signal<number>(0);
	public isActive = signal<boolean>(false);
	public isSuccess = signal<boolean>(false);
	public hasError = signal<boolean>(false);
	public isProgressBarVisible = signal<boolean>(false);

	private itemChangeSubscription!: Subscription;

	constructor() {
		effect(() => {
			if(this.item() != null) {
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
		await PopupToBackgroundLinkFacade.instance.removeContainer(this.item().id);
	}

	public async onPlayButtonClick() {
		await PopupToBackgroundLinkFacade.instance.doContainerAction(
			this.item().id, ProgramContainerAction.Play
		);
	}

	public async onStopButtonClick() {
		await PopupToBackgroundLinkFacade.instance.doContainerAction(
			this.item().id, ProgramContainerAction.Stop
		);
	}

	public async onPauseButtonClick() {
		await PopupToBackgroundLinkFacade.instance.doContainerAction(
			this.item().id, ProgramContainerAction.Pause
		);
	}

	public async onExpandButtonClick() {
		this.isSelected.set(!this.isSelected());
		this.update();
	}

	public async onSetCurrentTabClick() {
		const [currentTab] = await chrome.tabs.query( { active: true });
		if (currentTab != null) {
			this.item().tabId = currentTab.id!;
			await PopupToBackgroundLinkFacade.instance.updateContainers([this.item()]);
		}
	}

	private update(): void {
		this.visibility.set(this.calcElementsVisibility());

		this.tabExists.set(TabManager.instance.exists(this.item().tabId!));
		this.tabTitle.set(
			this.tabExists()
				? TabManager.instance.tab(this.item().tabId!)!.title!
				: 'Tab is closed, click to set current tab.'
		);

		this.actionIndex.set(this.item().activeActionIndex || 0);
		this.count.set(this.item().totalActions);
		this.progressBarValue.set(this.count() === 0 ? 0 : (100 * this.actionIndex() / this.count()));

		this.isSuccess.set(this.item().status === ProgramContainerStatus.Completed);
		this.hasError.set(this.item().error != null);

		this.isProgressBarVisible.set(
			this.item().status === ProgramContainerStatus.Paused ||
			this.item().status === ProgramContainerStatus.InProgress
		);
		this.isActive.set(this.isProgressBarVisible() || this.isSelected());
	}

	private calcElementsVisibility(): IElementsVisibility {
		return {
			playVisible: true,
			playDisabled: this.item().status === ProgramContainerStatus.InProgress,
			pauseVisible: true,
			pauseDisabled: this.item().status === ProgramContainerStatus.Paused ||
				this.item().status === ProgramContainerStatus.Stopped ||
				this.item().status === ProgramContainerStatus.New ||
				this.item().status === ProgramContainerStatus.Error ||
				this.item().status === ProgramContainerStatus.Completed,
			stopVisible: true,
			stopDisabled: this.item().status === ProgramContainerStatus.Stopped ||
				this.item().status === ProgramContainerStatus.New ||
				this.item().status === ProgramContainerStatus.Error ||
				this.item().status === ProgramContainerStatus.Completed
		};
	}
}
