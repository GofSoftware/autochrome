import { AutoValueSourceType } from '@autochrome/core/program/actions/types/i-interfaces';
import { z } from 'zod';

export const AutoValueSourceTypeEnumSchema = z.enum([
	AutoValueSourceType.attribute,
	AutoValueSourceType.innerText,
	AutoValueSourceType.textContent,
	AutoValueSourceType.innerHTML
]);
