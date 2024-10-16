import { AutoActionCheckType } from '@autochrome/core/program/actions/types/i-auto-action-check';
import { z } from 'zod';

export const AutoActionCheckTypeSchema = z.enum([
	AutoActionCheckType.Exists,
	AutoActionCheckType.NotExists
]);
