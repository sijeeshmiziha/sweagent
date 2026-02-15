/**
 * validate_todo_plan tool - validates JSON against todoPlanSchema + dependency checks
 */

import { createValidationTool } from '../../../lib/tools';
import { todoPlanSchema } from '../schemas';

export const validateTodoPlanTool = createValidationTool(
  'validate_todo_plan',
  todoPlanSchema,
  'Validates a todo plan JSON string against the TodoPlan schema. Checks structure, types, and required fields. Returns valid: true or valid: false with errors.',
  'plan'
);
