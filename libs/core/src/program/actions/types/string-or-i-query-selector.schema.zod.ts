import { IQuerySelectorSchema } from '@autochrome/core/program/actions/types/i-query-selector.schema.zod';
import { z } from 'zod';

export const StringOrIQuerySelectorSchema = z.union([
	z.string(),
	IQuerySelectorSchema
]);
