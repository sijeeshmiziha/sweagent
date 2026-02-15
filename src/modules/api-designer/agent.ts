/**
 * runApiDesignerAgent - orchestrator for API design
 */

import { runAgent } from '../../lib/agents';
import { createModel } from '../../lib/models/create-model';
import { createToolSet } from '../../lib/tools';
import { createSubagentToolSet } from '../../lib/subagents';
import { API_DESIGNER_SYSTEM_PROMPT } from './prompts';
import { createApiDesignerTools } from './tools';
import { endpointAnalyzerSubagent, contractDesignerSubagent } from './subagents';
import type { ApiDesignerAgentConfig } from './types';
import type { AgentResult } from '../../lib/types/agent';

const ORCHESTRATOR_SYSTEM_PROMPT = `${API_DESIGNER_SYSTEM_PROMPT}

You are the API design orchestrator. When the user asks for an API design:

1. **Analyze endpoints**: Use subagent_endpoint-analyzer to derive endpoints from the data model and requirements.
2. **Design contracts**: Use subagent_contract-designer to design request/response contracts, validation rules, and error responses.
3. **Generate design**: Use design_api (plain text) or design_api_pro (when data model and structured context are available) to produce the API design.
4. **Validate**: Use validate_api to check the final API design JSON before returning.

Respond with the final API design as JSON.`;

/**
 * Run the api-designer orchestrator agent with all tools and subagents.
 */
export async function runApiDesignerAgent(config: ApiDesignerAgentConfig): Promise<AgentResult> {
  const { input, model: modelConfig, maxIterations = 15, onStep, logger } = config;

  const model = createModel(modelConfig ?? { provider: 'openai', model: 'gpt-4o-mini' });
  const tools = createApiDesignerTools(model);
  const subagentTools = createSubagentToolSet(
    [endpointAnalyzerSubagent, contractDesignerSubagent],
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
