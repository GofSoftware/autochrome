import { z } from 'zod';
import { IParameterLinkSchema } from './i-parameter-link.schema.zod';
import { StringOrIQuerySelectorWithParametersSchema } from './string-or-i-query-selector-with-parameters.schema.zod';

export const QuerySelectorWithPropertyLinkSchema = z.union([
	StringOrIQuerySelectorWithParametersSchema,
	IParameterLinkSchema
]);
