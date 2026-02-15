/**
 * validate_auth tool - validates JSON against authDesignSchema (no AI)
 */

import { createValidationTool } from '../../../lib/tools';
import { authDesignSchema } from '../schemas';

export const validateAuthTool = createValidationTool(
  'validate_auth',
  authDesignSchema,
  'Validates an auth design JSON string against the AuthDesign schema. Returns valid: true or valid: false with errors.',
  'design'
);
