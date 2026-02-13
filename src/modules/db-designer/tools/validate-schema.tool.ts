/**
 * validate_schema tool - validates JSON against projectSchema (no AI)
 */

import { z } from 'zod';
import { defineTool } from '../../../lib/tools';
import { projectSchema } from '../schemas';

export const validateSchemaTool = defineTool({
  name: 'validate_schema',
  description:
    'Validates a MongoDB project schema JSON string against the expected schema. Returns valid: true or valid: false with errors array.',
  input: z.object({
    schema: z.string().describe('JSON string of the database project schema to validate'),
  }),
  handler: async ({ schema }): Promise<{ valid: boolean; errors?: string[] }> => {
    try {
      const parsed = JSON.parse(schema) as unknown;
      projectSchema.parse(parsed);
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
