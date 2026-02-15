/**
 * validate_nextjs tool - validates JSON against nextjsConfigSchema (no AI)
 */

import { z } from 'zod';
import { defineTool } from '../../../lib/tools';
import { nextjsConfigSchema } from '../schemas';

export const validateNextjsTool = defineTool({
  name: 'validate_nextjs',
  description:
    'Validates a Next.js config JSON string against the NextjsConfig schema. Returns valid: true or valid: false with errors.',
  input: z.object({
    config: z.string().describe('JSON string of the Next.js config to validate'),
  }),
  handler: async ({ config }): Promise<{ valid: boolean; errors?: string[] }> => {
    try {
      const parsed = JSON.parse(config) as unknown;
      nextjsConfigSchema.parse(parsed);
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
