/**
 * validate_schema tool - validates JSON against dataModelDesignSchema (no AI)
 */

import { z } from 'zod';
import { defineTool } from '../../../lib/tools';
import { dataModelDesignSchema } from '../schemas';

export const validateSchemaTool = defineTool({
  name: 'validate_data_model',
  description:
    'Validates a data model JSON string against the DataModelDesign schema. Returns valid: true or valid: false with errors.',
  input: z.object({
    schema: z.string().describe('JSON string of the data model to validate'),
  }),
  handler: async ({ schema }): Promise<{ valid: boolean; errors?: string[] }> => {
    try {
      const parsed = JSON.parse(schema) as unknown;
      dataModelDesignSchema.parse(parsed);
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
