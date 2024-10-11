import { AutoActionSchema } from '@autochrome/core/program/actions/auto-action.schema.zod';
import { IAutoProcedureSchema } from '@autochrome/core/program/i-auto-procedure.schema.zod';
import { z } from 'zod';

export const IAutoProgramSchema = z.object({
	name: z.string(),
	description: z.string(),
	version: z.number(),
	rootAction: AutoActionSchema,
	procedures: IAutoProcedureSchema
}).strict();
