/**
 * validate_backend tool - validates JSON against backendDesignSchema (no AI)
 */

import { createValidationTool } from '../../../lib/tools';
import { backendDesignSchema } from '../schemas';

export const validateBackendTool = createValidationTool(
  'validate_backend',
  backendDesignSchema,
  'Validates a backend design JSON string against the BackendDesign schema. Returns valid: true or valid: false with errors.',
  'design'
);
