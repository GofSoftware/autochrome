import { AutoActionClickType } from '@autochrome/core/program/actions/auto-action-click-type';
import { BaseAutoAction } from '@autochrome/core/program/actions/auto-action.schema.zod';
import { AutoActionName } from '@autochrome/core/program/actions/types/auto-action-name';
import { IQuerySelectorWithParametersSchema } from '@autochrome/core/program/actions/types/i-query-selector-with-parameters.schema.zod';
import { z } from 'zod';

export const AutoActionClickSchema = BaseAutoAction.extend({
	name: z.literal(AutoActionName.AutoActionClick),
	selector: IQuerySelectorWithParametersSchema,
	smoothMouse: z.boolean().optional(),
	wait: z.boolean().optional(),
	clickType: z.enum([
		AutoActionClickType.MouseDownFocusMouseUp,
		AutoActionClickType.Click
	]).optional(),
});
