import { IQuerySelectorWithParametersSchema } from './i-query-selector-with-parameters.schema.zod';
import { z } from 'zod';

export const IAutoParameterValueSchema = z.union([
	z.string(),
	z.number(),
	z.boolean(),
	IQuerySelectorWithParametersSchema,
]);
