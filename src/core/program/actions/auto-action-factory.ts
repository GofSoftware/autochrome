import { IAutoAction, AutoAction } from './auto-action';
import { AutoActionCheckGroup } from './auto-action-check-group';
import { AutoActionCheck } from './auto-action-check';
import { AutoActionEnterText } from './auto-action-enter-text';
import { AutoActionWait } from './auto-action-wait';
import { AutoActionScrollIntoView } from './auto-action-scroll-into-view';
import { AutoActionSelectFile } from './auto-action-select-file';
import { AutoActionWaitUntil } from './auto-action-wait-until';
import { AutoActionSetValue } from './auto-action-set-value';
import { AutoActionName } from './action-types';
import { AutoActionGetText } from './auto-action-get-text';
import { AutoActionClick } from './auto-action-click';
import { AutoActionCase } from './auto-action-case';
import { AutoActionDragNDrop } from './auto-action-drag-n-drop';
import { AutoActionRoot } from './auto-action-root';
import { AutoActionUrl } from './auto-action-url';
import { AutoActionFocus } from './auto-action-focus';
import { AutoActionProcedure } from './auto-action-procedure';
import { AutoActionEmpty } from './auto-action-empty';
import { AutoActionConsoleLog } from './auto-action-console-log';
import { AutoActionGoTo } from './auto-action-go-to';
import { AutoActionGroup } from './auto-action-group';

export class AutoActionFactory {

	private static autoActionFactoryInstance: AutoActionFactory;
	public static get instance(): AutoActionFactory {
		return AutoActionFactory.autoActionFactoryInstance || (AutoActionFactory.autoActionFactoryInstance = new AutoActionFactory());
	}

	private registry = new Map<AutoActionName, any>();
	private index = 0;

	private constructor() {
		this.registry.set(AutoActionName.AutoActionRoot, AutoActionRoot);
		this.registry.set(AutoActionName.AutoActionClick, AutoActionClick);
		this.registry.set(AutoActionName.AutoActionCheckGroup, AutoActionCheckGroup);
		this.registry.set(AutoActionName.AutoActionCheck, AutoActionCheck);
		this.registry.set(AutoActionName.AutoActionGetText, AutoActionGetText);
		this.registry.set(AutoActionName.AutoActionEnterText, AutoActionEnterText);
		this.registry.set(AutoActionName.AutoActionWait, AutoActionWait);
		this.registry.set(AutoActionName.AutoActionScrollIntoView, AutoActionScrollIntoView);
		this.registry.set(AutoActionName.AutoActionSelectFile, AutoActionSelectFile);
		this.registry.set(AutoActionName.AutoActionWaitUntil, AutoActionWaitUntil);
		this.registry.set(AutoActionName.AutoActionSetValue, AutoActionSetValue);
		this.registry.set(AutoActionName.AutoActionCase, AutoActionCase);
		this.registry.set(AutoActionName.AutoActionDragNDrop, AutoActionDragNDrop);
		this.registry.set(AutoActionName.AutoActionUrl, AutoActionUrl);
		this.registry.set(AutoActionName.AutoActionFocus, AutoActionFocus);
		this.registry.set(AutoActionName.AutoActionProcedure, AutoActionProcedure);
		this.registry.set(AutoActionName.AutoActionEmpty, AutoActionEmpty);
		this.registry.set(AutoActionName.AutoActionConsoleLog, AutoActionConsoleLog);
		this.registry.set(AutoActionName.AutoActionGoTo, AutoActionGoTo);
		this.registry.set(AutoActionName.AutoActionGroup, AutoActionGroup);
	}

	public fromJson(actionJson: IAutoAction): AutoAction {
		let action: AutoAction;

		if (this.registry.has(actionJson.name)) {
			action = this.registry.get(actionJson.name).fromJson(actionJson);
		} else {
			throw new Error(`The unsupported AutoAction ${actionJson.name}`);
		}
		return action;
	}

	public reset(): void {
		this.index = 0;
	}

	public nextIndex(): number {
		return this.index++;
	}
}
