import { HtmlElementHelper } from '../../core/common/html-element-helper';
import { ProgramContainer, ProgramContainerStatus } from '../../core/program/container/program-container';
import { AutoLinkClient } from '../../core/auto-link/auto-link-client';
import {
	IAutoMessageContainerChangeType,
	IAutoMessageDataContainerChanged,
	ProgramContainerAction
} from '../../core/auto-link/messaging/i-auto-message';
import { ProgramContainerManager } from '../../core/auto-link/program-container-manager';
import { BehaviorSubject, concatMap, filter, Observable, Subscription } from 'rxjs';
import { TabManager } from '../../core/common/tab-manager';
import { ExtractedProgramContainer } from '../../core/program/container/extracted-program-container';

export enum IProgramItemUpdateInfoType {
	Update = 'Update',
	Remove = 'Remove'
}

export interface IProgramItemUpdateInfo {
	type: IProgramItemUpdateInfoType;
	id: string;
}

export class ProgramItem {
	public static create(programContainer: ProgramContainer): ProgramItem {
		return new ProgramItem(programContainer);
	}

	public  extractedProgramContainer: ExtractedProgramContainer;
	private error: string;
	private containerChangeSubscription: Subscription;
	private itemChangedSubject$ = new BehaviorSubject<IProgramItemUpdateInfo>(null);
	private programItem: HTMLElement;

	private constructor(programContainer: ProgramContainer) {
		try {
			this.extractedProgramContainer = ExtractedProgramContainer.create(programContainer);
		} catch (error) {
			this.error = (error as Error)?.message || 'Unknown program parsing error.';
		}

		this.containerChangeSubscription = AutoLinkClient.instance().containerChanges$.pipe(
			filter((event: IAutoMessageDataContainerChanged) => event != null),
			concatMap(async (event: IAutoMessageDataContainerChanged) => {
				return await this.containerChanged(event);
			})
		).subscribe();
	}

	public get itemChanged$(): Observable<IProgramItemUpdateInfo> {
		return this.itemChangedSubject$.asObservable();
	}

	public destroy(): void {
		this.containerChangeSubscription?.unsubscribe();
	}

	public render(): HTMLElement {
		return this.error ? this.renderError() : this.renderItem();
	}

	private renderError(): HTMLElement {
		const programItem = document.createElement("div");
		const errorElement = HtmlElementHelper.createElementFromHTML(`
			<div class="error">${this.error}</div>
		`);
		programItem.append(errorElement);
		return programItem;
	}

	private renderItem(reCreate: boolean = false): HTMLElement {

		if (reCreate === true) {
			this.programItem = null;
		}

		if (this.programItem != null) {
			return this.programItem;
		}

		const visibility = this.calcElementsVisibility();

		this.programItem = document.createElement("div");

        const tabExists = TabManager.instance.exists(this.extractedProgramContainer.programContainer.tabId);
        const tabTitle = tabExists
			? TabManager.instance.tab(this.extractedProgramContainer.programContainer.tabId).title
			: 'Tab is closed, click to set current tab.';

		const actionIndex = this.extractedProgramContainer.activeAction?.index || 0;
		const count = this.extractedProgramContainer.program.count;
		const progressBarValue = count === 0 ? 0 : (100 * actionIndex / count);

		const content = HtmlElementHelper.createElementFromHTML(
			`
			<div class="uploaded-program">
				<div class="close-button"><button class="program-button program-square-button-small" title="Remove the item">x</button></div>
				<div class="tab-id ${tabExists ? '' : 'error pointer'}" title="${tabTitle}">Tab id: ${this.extractedProgramContainer.programContainer.tabId} <a>[set current]</a></div>
				<div class="name">(${this.extractedProgramContainer.programContainer.order}) ${this.extractedProgramContainer.program.name}</div>
				<div class="description">${this.extractedProgramContainer.program.description}</div>
				${this.extractedProgramContainer.programContainer.error != null ? `<div class="error">${this.extractedProgramContainer.programContainer.error}</div>` : ''}
				${this.extractedProgramContainer.programContainer.status === ProgramContainerStatus.Completed ? `<div class="success">Success.</div>` : ''}
				<div class="program-progress-bar-holder ${this.isProgressBarVisible() ? '' : 'hidden'}">
					<div>${this.extractedProgramContainer.activeAction ? this.extractedProgramContainer.activeAction.name : ''}</div>
					<div class="action-description">${this.extractedProgramContainer.activeAction ? this.extractedProgramContainer.activeAction.description : ''}</div>
					<div class="program-progress-bar">
						<div class="program-progress-bar-progress" style="width: ${progressBarValue}%"></div>
					</div>
				</div>
				<div class="uploaded-program-actions">
					<button
						class="program-button program-square-button play-button"
						title="Play"
						${visibility.playDisabled? 'disabled="disabled"' : ''}>
						<i class="fa-solid fa-play"></i>
					</button>
					<button
						class="program-button program-square-button pause-button"
						title="Pause"
						${visibility.pauseDisabled? 'disabled="disabled"' : ''}>
						<i class="fa-solid fa-pause"></i>
					</button>
					<button
						class="program-button program-square-button stop-button"
						title="Stop"
						${visibility.stopDisabled? 'disabled="disabled"' : ''}>
						<i class="fa-solid fa-stop"></i>
					</button>
				</div>
			</div>
			`
		);

		this.programItem.append(content);

		(this.programItem.querySelector('.close-button button') as HTMLElement).onclick = async () => {
			await AutoLinkClient.instance().removeContainer(this.extractedProgramContainer.programContainer.id);
		};
		(this.programItem.querySelector('.play-button') as HTMLElement).onclick = async () => {
			await AutoLinkClient.instance().doContainerAction(this.extractedProgramContainer.programContainer.id, ProgramContainerAction.Play);
		};
		(this.programItem.querySelector('.stop-button') as HTMLElement).onclick = async () => {
			await AutoLinkClient.instance().doContainerAction(this.extractedProgramContainer.programContainer.id, ProgramContainerAction.Stop);
		};
		(this.programItem.querySelector('.pause-button') as HTMLElement).onclick = async () => {
			await AutoLinkClient.instance().doContainerAction(this.extractedProgramContainer.programContainer.id, ProgramContainerAction.Pause);
		};
		((this.programItem.querySelector('.tab-id a') as HTMLElement) || {onclick}).onclick = async () => {
			const [currentTab] = await chrome.tabs.query( { active: true });
			if (currentTab != null) {
				this.extractedProgramContainer.programContainer.tabId = currentTab.id;
				await AutoLinkClient.instance().updateContainer(this.extractedProgramContainer.programContainer);
			}
		};
		return this.programItem;
	}

	private isProgressBarVisible(): boolean {
		return this.extractedProgramContainer.programContainer.status === ProgramContainerStatus.Paused ||
			this.extractedProgramContainer.programContainer.status === ProgramContainerStatus.InProgress;
	}

	private async containerChanged(event: IAutoMessageDataContainerChanged): Promise<void> {
		if (event.containerId !== this.extractedProgramContainer.programContainer.id) {
			return;
		}

		if (event.type === IAutoMessageContainerChangeType.Remove) {
			this.itemChangedSubject$.next({type: IProgramItemUpdateInfoType.Remove, id: this.extractedProgramContainer.programContainer.id});
		}

		const programContainer = await ProgramContainerManager.instance.getContainer(event.containerId);
		if (programContainer == null) {
			return;
		}
		this.extractedProgramContainer = ExtractedProgramContainer.create(programContainer);
		this.renderItem(true);
		this.itemChangedSubject$.next({type: IProgramItemUpdateInfoType.Update, id: this.extractedProgramContainer.programContainer.id});
	}

	private calcElementsVisibility(): any {
		return {
			playVisible: true,
			playDisabled: this.extractedProgramContainer.programContainer.status === ProgramContainerStatus.InProgress,
			pauseVisible: true,
			pauseDisabled: this.extractedProgramContainer.programContainer.status === ProgramContainerStatus.Paused ||
				this.extractedProgramContainer.programContainer.status === ProgramContainerStatus.Stopped ||
				this.extractedProgramContainer.programContainer.status === ProgramContainerStatus.Ready ||
				this.extractedProgramContainer.programContainer.status === ProgramContainerStatus.Error ||
				this.extractedProgramContainer.programContainer.status === ProgramContainerStatus.Completed,
			stopVisible: true,
			stopDisabled: this.extractedProgramContainer.programContainer.status === ProgramContainerStatus.Stopped ||
				this.extractedProgramContainer.programContainer.status === ProgramContainerStatus.Ready ||
				this.extractedProgramContainer.programContainer.status === ProgramContainerStatus.Error ||
				this.extractedProgramContainer.programContainer.status === ProgramContainerStatus.Completed
		};
	}

}
