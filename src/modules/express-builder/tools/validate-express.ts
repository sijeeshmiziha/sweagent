/**
 * validate_express tool - validates JSON against expressConfigSchema (no AI)
 */

import { z } from 'zod';
import { defineTool } from '../../../lib/tools';
import { expressConfigSchema } from '../schemas';

export const validateExpressTool = defineTool({
  name: 'validate_express',
  description:
    'Validates an Express config JSON string against the ExpressConfig schema. Returns valid: true or valid: false with errors.',
  input: z.object({
    config: z.string().describe('JSON string of the Express config to validate'),
  }),
  handler: async ({ config }): Promise<{ valid: boolean; errors?: string[] }> => {
    try {
      const parsed = JSON.parse(config) as unknown;
      expressConfigSchema.parse(parsed);
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
