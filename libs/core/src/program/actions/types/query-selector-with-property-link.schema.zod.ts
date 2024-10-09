import { IParameterLinkSchema } from '@autochrome/core/program/actions/types/i-parameter-link.schema.zod';
import {
	StringOrIQuerySelectorWithParametersSchema
} from '@autochrome/core/program/actions/types/string-or-i-query-selector-with-parameters.schema.zod';
import { z } from 'zod';

export const QuerySelectorWithPropertyLinkSchema = z.union([
	StringOrIQuerySelectorWithParametersSchema,
	IParameterLinkSchema
]);
