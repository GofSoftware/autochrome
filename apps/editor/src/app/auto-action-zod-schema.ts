
import { AutoActionClickType } from '@autochrome/core/program/actions/auto-action-click-type';
import { AutoActionName } from '@autochrome/core/program/actions/types/auto-action-name';
import { z } from 'zod';

const AutoActionNameEnumSchema = z.enum([
	AutoActionName.AutoActionRoot,
	AutoActionName.AutoActionClick,
	AutoActionName.AutoActionCheckGroup,
	AutoActionName.AutoActionCheck,
	AutoActionName.AutoActionGetText,
	AutoActionName.AutoActionEnterText,
	AutoActionName.AutoActionWait,
	AutoActionName.AutoActionScrollIntoView,
	AutoActionName.AutoActionSelectFile,
	AutoActionName.AutoActionWaitUntil,
	AutoActionName.AutoActionSetValue,
	AutoActionName.AutoActionCase,
	AutoActionName.AutoActionDragNDrop,
	AutoActionName.AutoActionUrl,
	AutoActionName.AutoActionFocus,
	AutoActionName.AutoActionProcedure,
	AutoActionName.AutoActionEmpty,
	AutoActionName.AutoActionConsoleLog,
	AutoActionName.AutoActionGoTo,
	AutoActionName.AutoActionGroup,
	AutoActionName.AutoActionCaseParameter,
]);


// TODO: refer to real AutoValueSourceType enum values
const AutoValueSourceTypeEnumSchema = z.enum([
	'attribute',
	'innerText',
	'textContent',
	'innerHTML'
])

const QuerySelectorBaseSchema = z.object({
	selector: z.string(),
	innerText: z.string().optional(),
	textContent: z.string().optional(),
	all: z.boolean().optional(),
	parentLevel: z.number().optional()
}).strict();

type QuerySelector = z.infer<typeof QuerySelectorBaseSchema> & {
	child?: string | QuerySelector;
	parent?: string | QuerySelector;
	iframe?: string | QuerySelector;
}

// You can define a recursive schema in Zod, but because of a limitation of TypeScript, their type can't be statically inferred.
// Instead, you'll need to define the type definition manually, and provide it to Zod as a "type hint".
const QuerySelectorSchema: z.ZodType<QuerySelector> = z.object({
	selector: z.string(),
	innerText: z.string().optional(),
	textContent: z.string().optional(),
	all: z.boolean().optional(),
	child: z.union([z.string(), z.lazy(() => QuerySelectorSchema)]).optional(),
	parent: z.union([z.string(), z.lazy(() => QuerySelectorSchema)]).optional(),
	iframe: z.union([z.string(), z.lazy(() => QuerySelectorSchema)]).optional(),
	parentLevel: z.number().optional(),
});

const StringOrIQuerySelectorSchema = z.union([z.string(), QuerySelectorSchema]);

const ParameterLinkSchema = z.object({
	type: z.literal('ParameterLink'), // TODO: refer to string from the type
	name: z.string()
})

const AutoValueBaseSchema = z.object({
	type: z.literal('AutoValue'),
	wait: z.boolean(),
	valueType: AutoValueSourceTypeEnumSchema,
	attributeName: z.string(),
});

type AutoValue = z.infer<typeof AutoValueBaseSchema> & {
	selector: z.infer<typeof QuerySelectorWithPropertyLinkSchema>
}

// TODO: requires to configure "strictNullChecks": true in tsconfig.base.json
const AutoValueSchema: z.ZodType<AutoValue> = AutoValueBaseSchema.extend({
	selector: z.lazy(() => QuerySelectorWithPropertyLinkSchema)
})

const QuerySelectorWithParametersBaseSchema = z.object({
	selector: z.union([StringOrIQuerySelectorSchema, ParameterLinkSchema]),
	innerText: z.union([z.string(), ParameterLinkSchema, AutoValueSchema]).optional(),
	textContent: z.union([z.string(), ParameterLinkSchema]),
	all: z.union([z.boolean(), ParameterLinkSchema]).optional(),
	parentLevel: z.union([z.number(), ParameterLinkSchema]).optional()
});

type QuerySelectorWithParameters = z.infer<typeof QuerySelectorWithParametersBaseSchema> & {
	child?: z.infer<typeof StringOrIQuerySelectorWithParametersSchema>,
	parent?: z.infer<typeof StringOrIQuerySelectorWithParametersSchema>,
	iframe?: z.infer<typeof StringOrIQuerySelectorWithParametersSchema>
}

const QuerySelectorWithParametersSchema: z.ZodType<QuerySelectorWithParameters> = QuerySelectorWithParametersBaseSchema.extend({
	child: z.lazy(() => StringOrIQuerySelectorWithParametersSchema).optional(),
	parent: z.lazy(() => StringOrIQuerySelectorWithParametersSchema).optional(),
	iframe: z.lazy(() => StringOrIQuerySelectorWithParametersSchema).optional(),
});

const StringOrIQuerySelectorWithParametersSchema = z.union([z.string(), QuerySelectorWithParametersSchema]);

const QuerySelectorWithPropertyLinkSchema = z.union([StringOrIQuerySelectorWithParametersSchema, ParameterLinkSchema]);

const AutoParameterValueSchema = z.union([
	z.string(),
	z.number(),
	z.boolean(),
	QuerySelectorWithParametersSchema,
]);

const AutoParameterSchema = z.object({
	name: z.string(),
	value: AutoParameterValueSchema,
});

export const BaseAutoAction = z.object({
	id: z.string().optional(),
	name: AutoActionNameEnumSchema,
	description: z.string().optional(),
	continueAfterFail: z.boolean().optional(),
	timeout: z.number().optional(),
	parameters: z.array(AutoParameterSchema).optional(),
});

export type AutoAction = z.infer<typeof BaseAutoAction> & { children?: AutoAction[] };

// You can define a recursive schema in Zod, but because of a limitation of TypeScript, their type can't be statically inferred.
// Instead, you'll need to define the type definition manually, and provide it to Zod as a "type hint".
const AutoActionRecursionSchema: z.ZodType<AutoAction> = BaseAutoAction.extend({
	children: z.lazy(() => z.array(AutoActionRecursionSchema)).optional(),
});

const AutoActionRoot = BaseAutoAction.extend({
	name: z.literal(AutoActionName.AutoActionRoot),
});

const AutoActionClick = BaseAutoAction.extend({
	name: z.literal(AutoActionName.AutoActionClick),
	selector: QuerySelectorWithParametersSchema,
	smoothMouse: z.boolean().optional(),
	wait: z.boolean().optional(),
	clickType: z.enum([
		AutoActionClickType.MouseDownFocusMouseUp,
		AutoActionClickType.Click
	]).optional(),
});

export const AutoActionSchema = AutoActionRecursionSchema.superRefine((data, ctx) => {
	let parsed = null;
	if (data.name === AutoActionName.AutoActionRoot) {
		parsed = AutoActionRoot.safeParse(data);
	} else if (data.name === AutoActionName.AutoActionClick) {
		parsed = AutoActionClick.safeParse(data);
	}
	if (parsed && !parsed.success) {
		parsed.error.errors.forEach((error) => ctx.addIssue(error)); // Add errors for invalid fields
	}
});

// Export the types and schemas
// export type AutoActionNameEnum = z.infer<typeof AutoActionNameEnum>;
// export type IBaseAutoAction = z.infer<typeof BaseAutoAction>;
// export type IAutoActionClick = z.infer<typeof AutoActionClick>;
