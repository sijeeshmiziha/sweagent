/**
 * validate_execution_plan tool - validates JSON against executionPlanSchema (no AI)
 */

import { z } from 'zod';
import { defineTool } from '../../../lib/tools';
import { executionPlanSchema } from '../schemas';

export const validateExecutionPlanTool = defineTool({
  name: 'validate_execution_plan',
  description:
    'Validates an execution plan JSON string against the ExecutionPlan schema. Returns valid: true or valid: false with errors.',
  input: z.object({
    plan: z.string().describe('JSON string of the execution plan to validate'),
  }),
  handler: async ({ plan }): Promise<{ valid: boolean; errors?: string[] }> => {
    try {
      const parsed = JSON.parse(plan) as unknown;
      executionPlanSchema.parse(parsed);
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
