import { BaseAutoAction } from '@autochrome/core/program/actions/auto-action.schema.zod';
import { AutoActionCaseParameterEnumSchema } from '@autochrome/core/program/actions/types/auto-action-case-parameter.enum.schema.zod';
import { AutoActionName } from '@autochrome/core/program/actions/types/auto-action-name';
import { z } from 'zod';

export const AutoActionCaseParameterSchema = BaseAutoAction.extend({
	name: z.literal(AutoActionName.AutoActionCaseParameter),
	parameterName: z.string(),
	operator: AutoActionCaseParameterEnumSchema,
	value: z.any(),
	thenActionId: z.string(),
	elseActionId: z.string()
}).strict();
