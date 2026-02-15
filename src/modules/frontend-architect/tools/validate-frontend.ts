/**
 * validate_frontend tool - validates JSON against frontendDesignSchema (no AI)
 */

import { z } from 'zod';
import { defineTool } from '../../../lib/tools';
import { frontendDesignSchema } from '../schemas';

export const validateFrontendTool = defineTool({
  name: 'validate_frontend',
  description:
    'Validates a frontend design JSON string against the FrontendDesign schema. Returns valid: true or valid: false with errors.',
  input: z.object({
    design: z.string().describe('JSON string of the frontend design to validate'),
  }),
  handler: async ({ design }): Promise<{ valid: boolean; errors?: string[] }> => {
    try {
      const parsed = JSON.parse(design) as unknown;
      frontendDesignSchema.parse(parsed);
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
