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

You are the API design orchestrator. You MUST use tools to generate the API design. Do NOT respond with a text-only answer or skip tool calls.

Follow these steps:

1. **Analyze endpoints**: Use subagent_endpoint-analyzer to derive endpoints from the data model and requirements.
2. **Design contracts**: Use subagent_contract-designer to design request/response contracts, validation rules, and error responses.
3. **Generate design**: You MUST call design_api (for plain text requirements) or design_api_pro (when data model and structured context are available) to produce the API design. This step is mandatory — never skip it.
4. **Validate**: Use validate_api to check the final API design JSON before returning.

CRITICAL: You MUST always call the design_api or design_api_pro tool. If a tool call fails, retry with adjusted input. Never fall back to a text-only response. The final output must be valid API design JSON with a non-empty endpoints array.`;

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
