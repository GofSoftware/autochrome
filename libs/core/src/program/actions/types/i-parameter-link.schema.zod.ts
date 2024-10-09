import { ParameterLinkTypeName } from './i-parameter-link';
import { z } from 'zod';

export const IParameterLinkSchema = z.object({
	type: z.literal(ParameterLinkTypeName),
	name: z.string()
})
