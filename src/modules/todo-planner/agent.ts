/**
 * runTodoPlannerAgent - orchestrator for todo plan generation
 */

import { runAgent } from '../../lib/agents';
import { createModel } from '../../lib/models/create-model';
import { createToolSet } from '../../lib/tools';
import { createSubagentToolSet } from '../../lib/subagents';
import { TODO_PLANNER_SYSTEM_PROMPT } from './prompts';
import { createTodoPlannerTools } from './tools';
import { problemDecomposerSubagent, dependencyResolverSubagent } from './subagents';
import type { TodoPlannerAgentConfig } from './types';
import type { AgentResult } from '../../lib/types/agent';

const ORCHESTRATOR_SYSTEM_PROMPT = `${TODO_PLANNER_SYSTEM_PROMPT}

You are the todo plan orchestrator. When the user provides a problem or task:

1. **Decompose**: Use subagent_problem-decomposer to break the problem into sub-problems, identify domains, constraints, and risks.
2. **Resolve dependencies**: Use subagent_dependency-resolver with the decomposition to determine task ordering, parallelizable work, and critical path.
3. **Generate plan**: Use create_todo_plan with the problem and the analysis context from steps 1-2 to produce the structured TodoPlan.
4. **Validate**: Use validate_todo_plan to check the final plan JSON before returning.

Respond with the final todo plan as JSON.`;

/**
 * Run the todo-planner orchestrator agent with all tools and subagents.
 */
export async function runTodoPlannerAgent(config: TodoPlannerAgentConfig): Promise<AgentResult> {
  const { input, model: modelConfig, maxIterations = 15, onStep, logger } = config;

  const model = createModel(modelConfig ?? { provider: 'openai', model: 'gpt-4o-mini' });
  const tools = createTodoPlannerTools(model);
  const subagentTools = createSubagentToolSet(
    [problemDecomposerSubagent, dependencyResolverSubagent],
    { parentModel: model }
  );
  const allTools = createToolSet({ ...tools, ...subagentTools });

  return runAgent({
    model,
    tools: allTools,
    systemPrompt: ORCHESTRATOR_SYSTEM_PROMPT,
    input,
    maxIterations,
    onStep,
    logger,
  });
}
