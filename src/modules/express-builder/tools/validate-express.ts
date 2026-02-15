/**
 * validate_express tool - validates JSON against expressConfigSchema (no AI)
 */

import { createValidationTool } from '../../../lib/tools';
import { expressConfigSchema } from '../schemas';

export const validateExpressTool = createValidationTool(
  'validate_express',
  expressConfigSchema,
  'Validates an Express config JSON string against the ExpressConfig schema. Returns valid: true or valid: false with errors.',
  'config'
);
