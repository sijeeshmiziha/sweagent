/**
 * runExecutionPlannerAgent - orchestrator for execution plan design
 */

import { runAgent } from '../../lib/agents';
import { createModel } from '../../lib/models/create-model';
import { createToolSet } from '../../lib/tools';
import { createSubagentToolSet } from '../../lib/subagents';
import { EXECUTION_PLANNER_SYSTEM_PROMPT } from './prompts';
import { createExecutionPlannerTools } from './tools';
import { edgeCaseAnalyzerSubagent, testingStrategistSubagent } from './subagents';
import type { ExecutionPlannerAgentConfig } from './types';
import type { AgentResult } from '../../lib/types/agent';

const ORCHESTRATOR_SYSTEM_PROMPT = `${EXECUTION_PLANNER_SYSTEM_PROMPT}

You are the execution planning orchestrator. When the user provides plan sections:

1. **Analyze edge cases**: Use subagent_edge-case-analyzer to identify edge cases per domain area with handling strategies.
2. **Design testing**: Use subagent_testing-strategist to design manual testing checklists grouped by feature flow.
3. **Generate plan**: Use create_execution_plan to produce the complete execution plan with phases, edge cases, and testing checklist.
4. **Validate**: Use validate_execution_plan to check the final plan JSON before returning.

Respond with the final execution plan as JSON.`;

/**
 * Run the execution-planner orchestrator agent with all tools and subagents.
 */
export async function runExecutionPlannerAgent(
  config: ExecutionPlannerAgentConfig
): Promise<AgentResult> {
  const { input, model: modelConfig, maxIterations = 15, onStep, logger } = config;

  const model = createModel(modelConfig ?? { provider: 'openai', model: 'gpt-4o-mini' });
  const tools = createExecutionPlannerTools(model);
  const subagentTools = createSubagentToolSet(
    [edgeCaseAnalyzerSubagent, testingStrategistSubagent],
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
