import { IQuerySelectorWithParametersSchema } from './i-query-selector-with-parameters.schema.zod';
import { z } from 'zod';

export const StringOrIQuerySelectorWithParametersSchema = z.union([
	z.string(),
	IQuerySelectorWithParametersSchema
]);
