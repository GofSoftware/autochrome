import { ProgramContainer } from '@autochrome/core/program/container/program-container';
import { AutoLinkClient } from '@autochrome/core/auto-link/auto-link-client';
import {
	AutoMessageContainerChangeType,
	IAutoMessageDataContainerChanged
} from '@autochrome/core/auto-link/messaging/i-auto-message';
import { ProgramContainerManager } from '@autochrome/core/auto-link/program-container-manager';
import { BehaviorSubject, concatMap, filter, Observable, Subscription } from 'rxjs';
import { ExtractedProgramContainer } from '@autochrome/core/program/container/extracted-program-container';

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

	public extractedProgramContainer!: ExtractedProgramContainer;
	public error: string | null = null;

	private containerChangeSubscription: Subscription;
	private itemChangedSubject$ = new BehaviorSubject<IProgramItemUpdateInfo | null>(null);

	private constructor(programContainer: ProgramContainer) {
		try {
			this.extractedProgramContainer = ExtractedProgramContainer.create(programContainer);
		} catch (error) {
			this.error = (error as Error)?.message || 'Unknown program parsing error.';
		}

		this.containerChangeSubscription = AutoLinkClient.instance().containerChanges$.pipe(
			filter((event) => event != null),
			concatMap(async (event) => {
				return await this.containerChanged(event!);
			})
		).subscribe();
	}

	public get itemChanged$(): Observable<IProgramItemUpdateInfo | null> {
		return this.itemChangedSubject$.asObservable();
	}

	public destroy(): void {
		this.containerChangeSubscription?.unsubscribe();
	}

	private async containerChanged(event: IAutoMessageDataContainerChanged): Promise<void> {
		if (event.containerId !== this.extractedProgramContainer.programContainer.id) {
			return;
		}

		if (event.type === AutoMessageContainerChangeType.Remove) {
			this.itemChangedSubject$.next(
				{type: IProgramItemUpdateInfoType.Remove, id: this.extractedProgramContainer.programContainer.id}
			);
		}

		const programContainer = await ProgramContainerManager.instance.getContainer(event.containerId);
		if (programContainer == null) {
			return;
		}
		this.extractedProgramContainer = ExtractedProgramContainer.create(programContainer);
		this.itemChangedSubject$.next({type: IProgramItemUpdateInfoType.Update, id: this.extractedProgramContainer.programContainer.id});
	}
}
