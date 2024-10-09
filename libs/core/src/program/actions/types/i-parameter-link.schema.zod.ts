import { ParameterLinkTypeName } from '@autochrome/core/program/actions/types/i-interfaces';
import { z } from 'zod';

export const IParameterLinkSchema = z.object({
	type: z.literal(ParameterLinkTypeName),
	name: z.string()
})
