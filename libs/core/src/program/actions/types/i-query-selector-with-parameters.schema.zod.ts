import { IAutoValueSchema } from '@autochrome/core/program/actions/types/i-auto-value.schema.zod';
import { IParameterLinkSchema } from '@autochrome/core/program/actions/types/i-parameter-link.schema.zod';
import {
	StringOrIQuerySelectorWithParametersSchema
} from '@autochrome/core/program/actions/types/string-or-i-query-selector-with-parameters.schema.zod';
import { StringOrIQuerySelectorSchema } from '@autochrome/core/program/actions/types/string-or-i-query-selector.schema.zod';
import { z } from 'zod';

const QuerySelectorWithParametersBaseSchema = z.object({
	selector: z.union([StringOrIQuerySelectorSchema, IParameterLinkSchema]),
	innerText: z.union([z.string(), IParameterLinkSchema, IAutoValueSchema]).optional(),
	textContent: z.union([z.string(), IParameterLinkSchema]),
	all: z.union([z.boolean(), IParameterLinkSchema]).optional(),
	parentLevel: z.union([z.number(), IParameterLinkSchema]).optional()
});

type QuerySelectorWithParameters = z.infer<typeof QuerySelectorWithParametersBaseSchema> & {
	child?: z.infer<typeof StringOrIQuerySelectorWithParametersSchema>,
	parent?: z.infer<typeof StringOrIQuerySelectorWithParametersSchema>,
	iframe?: z.infer<typeof StringOrIQuerySelectorWithParametersSchema>
}

export const IQuerySelectorWithParametersSchema: z.ZodType<QuerySelectorWithParameters> = QuerySelectorWithParametersBaseSchema.extend({
	child: z.lazy(() => StringOrIQuerySelectorWithParametersSchema).optional(),
	parent: z.lazy(() => StringOrIQuerySelectorWithParametersSchema).optional(),
	iframe: z.lazy(() => StringOrIQuerySelectorWithParametersSchema).optional(),
});
