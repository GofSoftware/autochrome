import { Component, effect, input, OnDestroy, signal, untracked } from '@angular/core';
import { ProgramContainerStatus } from '@autochrome/core/program/container/program-container-status';
import { PopupToBackgroundLinkFacade } from '../../business/popup-to-background-link-facade';
import { IBrowserTab, ProgramContainerAction } from '@autochrome/core/messaging/i-auto-message';
import { NgClass, NgIf, NgStyle } from '@angular/common';
import { IProgramContainerInfo } from '@autochrome/core/program/container/i-program-container';
import { AppService } from '../../business/app.service';
import { EventDisposableComponent } from '../event-disposable.component';

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
export class ProgramItemComponent extends EventDisposableComponent implements OnDestroy {
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
	public excluded = signal<boolean>(false);

    private enabledTabs: IBrowserTab[] = [];

	constructor() {
        super();
		effect(() => {
			if (this.item() != null) {
				untracked(() => {
					this.update();
				});
				this.unsubscribeAndRegisterNamed(AppService.instance.browserTabs$.subscribe((tabs) => {
					this.enabledTabs = tabs;
					if (this.item() != null) {
						untracked(() => {
							this.update();
						});
					}
				}), 'AppService.instance.browserTabs$');
			}
		});
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
        this.item().tabId = AppService.instance.getActiveTab()?.id || null;
        await PopupToBackgroundLinkFacade.instance.updateContainers([this.item()]);
	}

	private update(): void {
		this.visibility.set(this.calcElementsVisibility());

        const tab = this.enabledTabs.find((tab) => tab.id === this.item().tabId!);
		this.tabExists.set(tab != null);
		this.tabTitle.set(
			this.tabExists()
				? tab!.title
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
		this.excluded.set(this.item().excluded);
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
