/**
 * validate_frontend_config tool - validates JSON against ApplicationSchema (no AI)
 */

import { z } from 'zod';
import { defineTool } from '../../../lib/tools';
import { ApplicationSchema } from '../schemas';

export const validateFrontendConfigTool = defineTool({
  name: 'validate_frontend_config',
  description:
    'Validates a frontend configuration JSON string against the ApplicationSchema. Returns valid: true or valid: false with errors array.',
  input: z.object({
    config: z.string().describe('JSON string of the frontend application config to validate'),
  }),
  handler: async ({ config }): Promise<{ valid: boolean; errors?: string[] }> => {
    try {
      const parsed = JSON.parse(config) as unknown;
      ApplicationSchema.parse(parsed);
      return { valid: true };
    } catch (err) {
      if (err instanceof z.ZodError) {
        return {
          valid: false,
          errors: err.issues.map((e) => `${e.path.join('.')}: ${e.message}`),
        };
      }
      if (err instanceof SyntaxError) {
        return { valid: false, errors: [`Invalid JSON: ${err.message}`] };
      }
      return { valid: false, errors: [String(err)] };
    }
  },
});
