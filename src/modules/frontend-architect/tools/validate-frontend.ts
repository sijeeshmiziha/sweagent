/**
 * validate_frontend tool - validates JSON against frontendDesignSchema (no AI)
 */

import { createValidationTool } from '../../../lib/tools';
import { frontendDesignSchema } from '../schemas';

export const validateFrontendTool = createValidationTool(
  'validate_frontend',
  frontendDesignSchema,
  'Validates a frontend design JSON string against the FrontendDesign schema. Returns valid: true or valid: false with errors.',
  'design'
);
