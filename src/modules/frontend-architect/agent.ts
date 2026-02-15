/**
 * runFrontendArchitectAgent - orchestrator for frontend architecture design
 */

import { runAgent } from '../../lib/agents';
import { createModel } from '../../lib/models/create-model';
import { createToolSet } from '../../lib/tools';
import { createSubagentToolSet } from '../../lib/subagents';
import { FRONTEND_ARCHITECT_SYSTEM_PROMPT } from './prompts';
import { createFrontendArchitectTools } from './tools';
import { pagePlannerSubagent, componentAnalyzerSubagent } from './subagents';
import type { FrontendArchitectAgentConfig } from './types';
import type { AgentResult } from '../../lib/types/agent';

const ORCHESTRATOR_SYSTEM_PROMPT = `${FRONTEND_ARCHITECT_SYSTEM_PROMPT}

You are the frontend architecture orchestrator. When the user asks for a frontend design:

1. **Plan pages**: Use subagent_page-planner to design detailed page specifications with routes, forms, actions, and states.
2. **Analyze components**: Use subagent_component-analyzer to identify reusable components, layouts, and state management patterns.
3. **Generate design**: Use design_frontend to produce the complete frontend architecture as JSON.
4. **Validate**: Use validate_frontend to check the final design JSON before returning.

Respond with the final frontend design as JSON.`;

/**
 * Run the frontend-architect orchestrator agent with all tools and subagents.
 */
export async function runFrontendArchitectAgent(
  config: FrontendArchitectAgentConfig
): Promise<AgentResult> {
  const { input, model: modelConfig, maxIterations = 15, onStep, logger } = config;

  const model = createModel(modelConfig ?? { provider: 'openai', model: 'gpt-4o-mini' });
  const tools = createFrontendArchitectTools(model);
  const subagentTools = createSubagentToolSet([pagePlannerSubagent, componentAnalyzerSubagent], {
    parentModel: model,
  });
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
