import { AutoActionNameEnumSchema } from '@autochrome/core/program/actions/types/auto-action-name.schema.zod';
import { AutoActionResultEnumSchema } from '@autochrome/core/program/actions/types/auto-action-result.schema.zod';
import { IAutoParameterSchema } from '@autochrome/core/program/actions/types/i-auto-parameter.schema.zod';
import { z } from 'zod';

export const BaseAutoAction = z.object({
	id: z.string(),
	index: z.number(),
	name: AutoActionNameEnumSchema,
	description: z.union([z.string(), z.undefined()]),
	result: AutoActionResultEnumSchema,
	resultValue: z.any(),
	continueAfterFail: z.boolean(),
	timeout: z.number(),
	parameters: z.array(IAutoParameterSchema),
});

export type AutoActionType = z.infer<typeof BaseAutoAction> & {
	previous: AutoActionType, // TODO: replace with AutoAnyAction
	next: AutoActionType, // TODO: replace with AutoAnyAction
	children: AutoActionType[]
};

// You can define a recursive schema in Zod, but because of a limitation of TypeScript, their type can't be statically inferred.
// Instead, you'll need to define the type definition manually, and provide it to Zod as a "type hint".
export const AutoActionSchema: z.ZodType<AutoActionType> = BaseAutoAction.extend({
	previous: z.lazy(() => AutoActionSchema),
	next: z.lazy(() => AutoActionSchema),
	children: z.lazy(() => z.array(AutoActionSchema)),
});
