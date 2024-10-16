import { AutoActionGroupOperator } from '@autochrome/core/program/actions/types/i-auto-action-check-group';
import { z } from 'zod';

export const AutoActionGroupOperatorSchema = z.enum([
	AutoActionGroupOperator.Or,
	AutoActionGroupOperator.And
]);
