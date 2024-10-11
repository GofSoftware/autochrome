import { BaseAutoAction } from '@autochrome/core/program/actions/auto-action.schema.zod';
import { AutoActionName } from '@autochrome/core/program/actions/types/auto-action-name';
import { z } from 'zod';

export const AutoActionRootSchema = BaseAutoAction.extend({
	name: z.literal(AutoActionName.AutoActionRoot),
}).strict();
