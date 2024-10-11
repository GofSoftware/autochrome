import { AutoActionCaseParameterOperator } from '@autochrome/core/program/actions/types/i-auto-action-case-parameter';
import { z } from 'zod';

export const AutoActionCaseParameterEnumSchema = z.enum([
	AutoActionCaseParameterOperator.Equal,
	AutoActionCaseParameterOperator.NotEqual
]);
