/**
 * validate_execution_plan tool - validates JSON against executionPlanSchema (no AI)
 */

import { createValidationTool } from '../../../lib/tools';
import { executionPlanSchema } from '../schemas';

export const validateExecutionPlanTool = createValidationTool(
  'validate_execution_plan',
  executionPlanSchema,
  'Validates an execution plan JSON string against the ExecutionPlan schema. Returns valid: true or valid: false with errors.',
  'plan'
);
