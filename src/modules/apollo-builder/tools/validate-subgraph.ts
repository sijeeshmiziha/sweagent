/**
 * validate_subgraph tool - validates JSON against subgraphConfigSchema (no AI)
 */

import { z } from 'zod';
import { defineTool } from '../../../lib/tools';
import { subgraphConfigSchema } from '../schemas';

export const validateSubgraphTool = defineTool({
  name: 'validate_subgraph',
  description:
    'Validates a subgraph config JSON string against the SubgraphConfig schema. Returns valid: true or valid: false with errors.',
  input: z.object({
    config: z.string().describe('JSON string of the subgraph config to validate'),
  }),
  handler: async ({ config }): Promise<{ valid: boolean; errors?: string[] }> => {
    try {
      const parsed = JSON.parse(config) as unknown;
      subgraphConfigSchema.parse(parsed);
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
