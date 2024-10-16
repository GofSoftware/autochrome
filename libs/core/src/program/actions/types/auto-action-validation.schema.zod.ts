import { AutoActionCaseParameterSchema } from '@autochrome/core/program/actions/auto-action-case-parameter.schema.zod';
import { AutoActionCaseSchema } from '@autochrome/core/program/actions/auto-action-case.schema.zod';
import { AutoActionCheckSchema } from '@autochrome/core/program/actions/auto-action-check.schema.zod';
import { AutoActionClickSchema } from '@autochrome/core/program/actions/auto-action-click.schema.zod';
import { AutoActionRootSchema } from '@autochrome/core/program/actions/auto-action-root.schema.zod';
import { AutoActionSchema } from '@autochrome/core/program/actions/auto-action.schema.zod';
import { AutoActionName } from '@autochrome/core/program/actions/types/auto-action-name';

export const AutoActionValidationSchema = AutoActionSchema.superRefine((data, ctx) => {
	let parsed = null;
	if (data.name === AutoActionName.AutoActionCase) {
		parsed = AutoActionCaseSchema.safeParse(data);
	} else if (data.name === AutoActionName.AutoActionCaseParameter) {
		parsed = AutoActionCaseParameterSchema.safeParse(data);
	} else if (data.name === AutoActionName.AutoActionRoot) {
		parsed = AutoActionRootSchema.safeParse(data);
	} else if (data.name === AutoActionName.AutoActionClick) {
		parsed = AutoActionClickSchema.safeParse(data);
	} else if (data.name === AutoActionName.AutoActionCheckGroup) {
		parsed = AutoActionCheckSchema.safeParse(data);
	}
	if (parsed && !parsed.success) {
		parsed.error.errors.forEach((error) => ctx.addIssue(error)); // Add errors for invalid fields
	}
});
