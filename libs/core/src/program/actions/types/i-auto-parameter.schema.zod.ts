import { IAutoParameterValueSchema } from '@autochrome/core/program/actions/types/i-auto-parameter-value.schema.zod';
import { z } from 'zod';

export const IAutoParameterSchema = z.object({
	name: z.string(),
	value: IAutoParameterValueSchema,
});
