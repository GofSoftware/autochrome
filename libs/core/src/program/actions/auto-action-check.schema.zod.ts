import { BaseAutoAction } from '@autochrome/core/program/actions/auto-action.schema.zod';
import { AutoActionName } from '@autochrome/core/program/actions/types/auto-action-name';
import { AutoActionCheckTypeSchema } from '@autochrome/core/program/actions/types/auto-action-type.schema.zod';
import { QuerySelectorWithPropertyLinkSchema } from '@autochrome/core/program/actions/types/query-selector-with-property-link.schema.zod';
import { z } from 'zod';

export const AutoActionCheckSchema = BaseAutoAction.extend({
	name: z.literal(AutoActionName.AutoActionCheck),
	type: AutoActionCheckTypeSchema,
	selector: QuerySelectorWithPropertyLinkSchema,
	wait: z.boolean().optional(),
	silent: z.boolean().optional(),
	highlight: z.boolean().optional()
}).strict();
