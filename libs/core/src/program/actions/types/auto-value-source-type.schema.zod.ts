import { AutoValueSourceType } from './auto-value-source-type';
import { z } from 'zod';

export const AutoValueSourceTypeEnumSchema = z.enum([
	AutoValueSourceType.attribute,
	AutoValueSourceType.innerText,
	AutoValueSourceType.textContent,
	AutoValueSourceType.innerHTML
]);
