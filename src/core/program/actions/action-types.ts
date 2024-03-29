import { AutoActionClick } from './auto-action-click';
import { AutoActionCheckGroup } from './auto-action-check-group';
import { AutoActionCheck } from './auto-action-check';
import { AutoAction } from './auto-action';
import { AutoActionGetText } from './auto-action-get-text';
import { AutoActionWait } from './auto-action-wait';
import { AutoActionScrollIntoView } from './auto-action-scroll-into-view';
import { AutoActionSelectFile } from './auto-action-select-file';
import { AutoActionWaitUntil } from './auto-action-wait-until';
import { AutoActionSetValue } from './auto-action-set-value';
import { AutoActionCase } from './auto-action-case';
import { AutoActionDragNDrop } from './auto-action-drag-n-drop';
import { AutoActionUrl } from './auto-action-url';

export enum AutoActionName {
	AutoActionRoot = 'AutoActionRoot',
	AutoActionClick = 'AutoActionClick',
	AutoActionCheckGroup  = 'AutoActionCheckGroup',
	AutoActionCheck  = 'AutoActionCheck',
	AutoActionGetText  = 'AutoActionGetText',
	AutoActionEnterText = 'AutoActionEnterText',
	AutoActionWait  = 'AutoActionWait',
	AutoActionScrollIntoView  = 'AutoActionScrollIntoView',
	AutoActionSelectFile  = 'AutoActionSelectFile',
	AutoActionWaitUntil  = 'AutoActionWaitUntil',
	AutoActionSetValue= 'AutoActionSetValue',
	AutoActionCase= 'AutoActionCase',
	AutoActionDragNDrop= 'AutoActionDragNDrop',
	AutoActionUrl= 'AutoActionUrl',
	AutoActionFocus= 'AutoActionFocus'
}

export type AutoAnyAction = AutoAction | AutoActionCheck | AutoActionCheckGroup | AutoActionClick | AutoActionGetText |
	AutoActionWait | AutoActionScrollIntoView | AutoActionSelectFile | AutoActionWaitUntil | AutoActionSetValue | AutoActionCase |
	AutoActionDragNDrop | AutoActionUrl;

export enum AutoActionResult {
	Success = 'Success',
	Failed = 'Failed'
}
