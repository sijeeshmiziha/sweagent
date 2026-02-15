/**
 * runBackendArchitectAgent - routing orchestrator for backend design
 * Delegates to express-builder or apollo-builder based on framework selection.
 */

import { runAgent } from '../../lib/agents';
import { createModel } from '../../lib/models/create-model';
import { createToolSet } from '../../lib/tools';
import { createSubagentToolSet } from '../../lib/subagents';
import { BACKEND_ARCHITECT_SYSTEM_PROMPT } from './prompts';
import { createBackendArchitectTools } from './tools';
import { servicePlannerSubagent, frameworkSelectorSubagent } from './subagents';
import type { BackendArchitectAgentConfig } from './types';
import type { AgentResult } from '../../lib/types/agent';

const ORCHESTRATOR_SYSTEM_PROMPT = `${BACKEND_ARCHITECT_SYSTEM_PROMPT}

You are the backend architecture orchestrator. When the user provides requirements:

1. **Select framework**: Use subagent_framework-selector to analyze requirements and recommend Express, Apollo, or both.
2. **Plan services**: Use subagent_service-planner to design the service layer, middleware stack, and folder structure.
3. **Generate design**: Use design_backend to produce the complete backend architecture as JSON.
4. **Validate**: Use validate_backend to check the final design JSON before returning.

After generating the design, note the "framework" field in the result:
- If "express": the downstream express-builder should be used to scaffold the project.
- If "apollo": the downstream apollo-builder should be used to scaffold the project.
- If "both": both builders should be invoked sequentially.

Respond with the final backend design as JSON.`;

/**
 * Run the backend-architect orchestrator agent.
 */
export async function runBackendArchitectAgent(
  config: BackendArchitectAgentConfig
): Promise<AgentResult> {
  const { input, model: modelConfig, maxIterations = 15, onStep, logger } = config;

  const model = createModel(modelConfig ?? { provider: 'openai', model: 'gpt-4o-mini' });
  const tools = createBackendArchitectTools(model);
  const subagentTools = createSubagentToolSet([servicePlannerSubagent, frameworkSelectorSubagent], {
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
