/**
 * validate_backend tool - validates JSON against backendDesignSchema (no AI)
 */

import { z } from 'zod';
import { defineTool } from '../../../lib/tools';
import { backendDesignSchema } from '../schemas';

export const validateBackendTool = defineTool({
  name: 'validate_backend',
  description:
    'Validates a backend design JSON string against the BackendDesign schema. Returns valid: true or valid: false with errors.',
  input: z.object({
    design: z.string().describe('JSON string of the backend design to validate'),
  }),
  handler: async ({ design }): Promise<{ valid: boolean; errors?: string[] }> => {
    try {
      const parsed = JSON.parse(design) as unknown;
      backendDesignSchema.parse(parsed);
      return { valid: true };
    } catch (err) {
      if (err instanceof z.ZodError) {
        return {
          valid: false,
          errors: err.issues.map(e => `${e.path.join('.')}: ${e.message}`),
        };
      }
      if (err instanceof SyntaxError) {
        return { valid: false, errors: [`Invalid JSON: ${err.message}`] };
      }
      return { valid: false, errors: [String(err)] };
    }
  },
});
