/**
 * validate_api tool - validates JSON against apiDesignSchema (no AI)
 */

import { z } from 'zod';
import { defineTool } from '../../../lib/tools';
import { apiDesignSchema } from '../schemas';

export const validateApiTool = defineTool({
  name: 'validate_api',
  description:
    'Validates an API design JSON string against the ApiDesign schema. Returns valid: true or valid: false with errors.',
  input: z.object({
    design: z.string().describe('JSON string of the API design to validate'),
  }),
  handler: async ({ design }): Promise<{ valid: boolean; errors?: string[] }> => {
    try {
      const parsed = JSON.parse(design) as unknown;
      apiDesignSchema.parse(parsed);
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
