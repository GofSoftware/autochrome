import { AutoValueSourceTypeEnumSchema } from './auto-value-source-type.schema.zod';
import { QuerySelectorWithPropertyLinkSchema } from './query-selector-with-property-link.schema.zod';
import { z } from 'zod';

const IAutoValueBaseSchema = z.object({
	type: z.literal('AutoValue'),
	wait: z.boolean(),
	valueType: AutoValueSourceTypeEnumSchema,
	attributeName: z.string(),
});

type IAutoValueType = z.infer<typeof IAutoValueBaseSchema> & {
	selector: z.infer<typeof QuerySelectorWithPropertyLinkSchema>
}

export const IAutoValueSchema: z.ZodType<IAutoValueType> = IAutoValueBaseSchema.extend({
	selector: z.lazy(() => QuerySelectorWithPropertyLinkSchema)
})