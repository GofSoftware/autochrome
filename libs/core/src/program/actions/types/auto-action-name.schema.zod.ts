import { AutoActionName } from './auto-action-name';
import { z } from 'zod';

export const AutoActionNameEnumSchema = z.enum([
	AutoActionName.AutoActionRoot,
	AutoActionName.AutoActionClick,
	AutoActionName.AutoActionCheckGroup,
	AutoActionName.AutoActionCheck,
	AutoActionName.AutoActionGetText,
	AutoActionName.AutoActionEnterText,
	AutoActionName.AutoActionWait,
	AutoActionName.AutoActionScrollIntoView,
	AutoActionName.AutoActionSelectFile,
	AutoActionName.AutoActionWaitUntil,
	AutoActionName.AutoActionSetValue,
	AutoActionName.AutoActionCase,
	AutoActionName.AutoActionDragNDrop,
	AutoActionName.AutoActionUrl,
	AutoActionName.AutoActionFocus,
	AutoActionName.AutoActionProcedure,
	AutoActionName.AutoActionEmpty,
	AutoActionName.AutoActionConsoleLog,
	AutoActionName.AutoActionGoTo,
	AutoActionName.AutoActionGroup,
	AutoActionName.AutoActionCaseParameter,
]);
