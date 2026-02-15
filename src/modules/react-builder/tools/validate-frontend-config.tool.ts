/**
 * validate_frontend_config tool - validates JSON against ApplicationSchema (no AI)
 */

import { createValidationTool } from '../../../lib/tools';
import { ApplicationSchema } from '../schemas';

export const validateFrontendConfigTool = createValidationTool(
  'validate_frontend_config',
  ApplicationSchema,
  'Validates a frontend configuration JSON string against the ApplicationSchema. Returns valid: true or valid: false with errors array.',
  'config'
);
