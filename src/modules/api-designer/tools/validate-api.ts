/**
 * validate_api tool - validates JSON against apiDesignSchema (no AI)
 */

import { createValidationTool } from '../../../lib/tools';
import { apiDesignSchema } from '../schemas';

export const validateApiTool = createValidationTool(
  'validate_api',
  apiDesignSchema,
  'Validates an API design JSON string against the ApiDesign schema. Returns valid: true or valid: false with errors.',
  'design'
);
