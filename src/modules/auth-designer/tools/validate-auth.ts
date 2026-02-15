/**
 * validate_auth tool - validates JSON against authDesignSchema (no AI)
 */

import { z } from 'zod';
import { defineTool } from '../../../lib/tools';
import { authDesignSchema } from '../schemas';

export const validateAuthTool = defineTool({
  name: 'validate_auth',
  description:
    'Validates an auth design JSON string against the AuthDesign schema. Returns valid: true or valid: false with errors.',
  input: z.object({
    design: z.string().describe('JSON string of the auth design to validate'),
  }),
  handler: async ({ design }): Promise<{ valid: boolean; errors?: string[] }> => {
    try {
      const parsed = JSON.parse(design) as unknown;
      authDesignSchema.parse(parsed);
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
