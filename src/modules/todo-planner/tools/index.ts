/**
 * todo-planner tools
 */

import type { Model } from '../../../lib/types/model';
import { createToolSet } from '../../../lib/tools';
import { validateTodoPlanTool } from './validate-todo-plan';
import { createTodoPlanTool } from './create-todo-plan';

export { validateTodoPlanTool } from './validate-todo-plan';
export { createTodoPlanTool } from './create-todo-plan';

/**
 * Create all todo-planner tools. Pass the model for AI-backed tools.
 */
export function createTodoPlannerTools(model: Model) {
  return createToolSet({
    validate_todo_plan: validateTodoPlanTool,
    create_todo_plan: createTodoPlanTool(model),
  });
}
