import { AutoActionClickType } from '@autochrome/core/program/actions/auto-action-click-type';
import { BaseAutoAction } from '@autochrome/core/program/actions/auto-action.schema.zod';
import { AutoActionName } from '@autochrome/core/program/actions/types/auto-action-name';
import { QuerySelectorWithPropertyLinkSchema } from '@autochrome/core/program/actions/types/query-selector-with-property-link.schema.zod';
import { z } from 'zod';

export const AutoActionCaseSchema = BaseAutoAction.extend({
	name: z.literal(AutoActionName.AutoActionCase),
	selector: QuerySelectorWithPropertyLinkSchema,
	wait: z.boolean().optional(),
	thenActionId: z.string(),
	elseActionId: z.string()
}).strict();
