import { AutoActionValidationSchema } from '@autochrome/core/program/actions/types/auto-action-validation.schema.zod';
import { z } from 'zod';

export const IAutoProcedureSchema = z.object({
	name: z.string(),
	description: z.string(),
	action: AutoActionValidationSchema
}).strict();
