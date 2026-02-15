/**
 * execution-planner tools
 */

import type { Model } from '../../../lib/types/model';
import { createToolSet } from '../../../lib/tools';
import { validateExecutionPlanTool } from './validate-plan';
import { createExecutionPlanTool } from './create-plan';

export { validateExecutionPlanTool } from './validate-plan';
export { createExecutionPlanTool } from './create-plan';

/**
 * Create all execution-planner tools. Pass the model for AI-backed tools.
 */
export function createExecutionPlannerTools(model: Model) {
  return createToolSet({
    validate_execution_plan: validateExecutionPlanTool,
    create_execution_plan: createExecutionPlanTool(model),
  });
}
