import { AutoAction } from './auto-action';
import { AutoActionCheckGroup } from './auto-action-check-group';
import { AutoActionCheck } from './auto-action-check';
import { AutoActionEnterText } from './auto-action-enter-text';
import { AutoActionWait } from './auto-action-wait';
import { AutoActionScrollIntoView } from './auto-action-scroll-into-view';
import { AutoActionSelectFile } from './auto-action-select-file';
import { AutoActionWaitUntil } from './auto-action-wait-until';
import { AutoActionSetValue } from './auto-action-set-value';
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
import { AutoActionCaseParameter } from './auto-action-case-parameter';
import { AutoProcedure } from '../../program/auto-procedure';
import { IAutoAction } from "./types/i-auto-action";
import { AutoActionName } from "./types/auto-action-name";
import { IAutoActionProcedure } from './types/i-auto-action-procedure';
import { IAutoProcedure } from '../i-auto-procedure';

export class AutoActionFactory {

	private static autoActionFactoryInstance: AutoActionFactory;
	public static get instance(): AutoActionFactory {
		return AutoActionFactory.autoActionFactoryInstance || (AutoActionFactory.autoActionFactoryInstance = new AutoActionFactory());
	}

	public skipProcedureInstantiation = false;

	private registry = new Map<AutoActionName, any>();
	private procedureMap = new Map<string, IAutoProcedure>();
	private registeredGlobalProcedures = new Set<string>();
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
		this.registry.set(AutoActionName.AutoActionCaseParameter, AutoActionCaseParameter);
	}

	public fromJson(autoAction: IAutoAction): AutoAction {
		if (this.registry.has(autoAction.name)) {

			const action: AutoAction = this.registry.get(autoAction.name).fromJson(autoAction);

			if (autoAction.name === AutoActionName.AutoActionProcedure && !this.skipProcedureInstantiation) {
				if (Array.isArray(autoAction.children) && autoAction.children.length > 0) {
					throw new Error(`${autoAction.name} doesn't support "children" at the moment.`);
				} else {
					if (!this.procedureMap.has((autoAction as IAutoActionProcedure).procedureName)) {
						throw new Error(`Unknown procedure: ${(autoAction as IAutoActionProcedure).procedureName}`);
					}
					const procedureAction = AutoProcedure.instantiateAction(
						this.procedureMap.get((autoAction as IAutoActionProcedure).procedureName)!.action,
						(action as unknown as IAutoActionProcedure).id!,
						(action as unknown as IAutoActionProcedure).parameters ?? []);

					action.children.push(procedureAction);
					procedureAction.previous = action;
					const procNextAction = action.next;
					action.next = procedureAction;
					const lastProcedureAction = procedureAction.getLastAction();
					lastProcedureAction.next = procNextAction;
					if (procNextAction != null) { // can be null if the proc is the last action in the program.
						procNextAction.previous = lastProcedureAction;
					}
				}
			}

			return action;
		}
		throw new Error(`The unsupported AutoAction ${autoAction.name}`);
	}

	public reset(): void {
		this.index = 0;
		this.procedureMap.clear();
		this.registeredGlobalProcedures.clear();
	}

	public setProcedure(procedure: IAutoProcedure): void {
		this.procedureMap.set(procedure.name, procedure);
		if (procedure.global) {
			this.registeredGlobalProcedures.add(procedure.name);
		}
	}

	public hasGlobalProcedure(name: string): boolean {
		return this.registeredGlobalProcedures.has(name);
	}

	public nextIndex(): number {
		return this.index++;
	}
}
