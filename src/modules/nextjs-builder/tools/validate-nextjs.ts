/**
 * validate_nextjs tool - validates JSON against nextjsConfigSchema (no AI)
 */

import { createValidationTool } from '../../../lib/tools';
import { nextjsConfigSchema } from '../schemas';

export const validateNextjsTool = createValidationTool(
  'validate_nextjs',
  nextjsConfigSchema,
  'Validates a Next.js config JSON string against the NextjsConfig schema. Returns valid: true or valid: false with errors.',
  'config'
);
