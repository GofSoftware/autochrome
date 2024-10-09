import { AutoActionResult } from '@autochrome/core/program/actions/types/auto-action-result';
import { z } from 'zod';

export const AutoActionResultEnumSchema = z.enum([
	AutoActionResult.Success,
	AutoActionResult.Failed
]);
