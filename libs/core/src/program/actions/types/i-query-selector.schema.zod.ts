import { StringOrIQuerySelectorSchema } from './string-or-i-query-selector.schema.zod';
import { z } from 'zod';

const IQuerySelectorBaseSchema = z.object({
	selector: z.string(),
	innerText: z.string().optional(),
	textContent: z.string().optional(),
	all: z.boolean().optional(),
	parentLevel: z.number().optional()
}).strict();

type IQuerySelectorType = z.infer<typeof IQuerySelectorBaseSchema> & {
	child?: z.infer<typeof StringOrIQuerySelectorSchema>;
	parent?: z.infer<typeof StringOrIQuerySelectorSchema>;
	iframe?: z.infer<typeof StringOrIQuerySelectorSchema>;
}

// You can define a recursive schema in Zod, but because of a limitation of TypeScript, their type can't be statically inferred.
// Instead, you'll need to define the type definition manually, and provide it to Zod as a "type hint".
export const IQuerySelectorSchema: z.ZodType<IQuerySelectorType> = IQuerySelectorBaseSchema.extend({
	child: z.union([z.string(), z.lazy(() => IQuerySelectorSchema)]).optional(),
	parent: z.union([z.string(), z.lazy(() => IQuerySelectorSchema)]).optional(),
	iframe: z.union([z.string(), z.lazy(() => IQuerySelectorSchema)]).optional(),
});
