/**
 * runAuthDesignerAgent - orchestrator for auth design
 */

import { runAgent } from '../../lib/agents';
import { createModel } from '../../lib/models/create-model';
import { createToolSet } from '../../lib/tools';
import { createSubagentToolSet } from '../../lib/subagents';
import { AUTH_DESIGNER_SYSTEM_PROMPT } from './prompts';
import { createAuthDesignerTools } from './tools';
import { securityAnalyzerSubagent, flowDesignerSubagent } from './subagents';
import type { AuthDesignerAgentConfig } from './types';
import type { AgentResult } from '../../lib/types/agent';

const ORCHESTRATOR_SYSTEM_PROMPT = `${AUTH_DESIGNER_SYSTEM_PROMPT}

You are the auth design orchestrator. When the user asks for an auth design:

1. **Analyze security**: Use subagent_security-analyzer to analyze security requirements, determine auth strategy, and identify threat vectors.
2. **Design flows**: Use subagent_flow-designer to design step-by-step auth flows (signup, login, logout, password reset, middleware).
3. **Generate design**: Use design_auth to produce the complete auth design with flows, middleware, roles, and security policies.
4. **Validate**: Use validate_auth to check the final auth design JSON before returning.

Respond with the final auth design as JSON.`;

/**
 * Run the auth-designer orchestrator agent with all tools and subagents.
 */
export async function runAuthDesignerAgent(config: AuthDesignerAgentConfig): Promise<AgentResult> {
  const { input, model: modelConfig, maxIterations = 15, onStep, logger } = config;

  const model = createModel(modelConfig ?? { provider: 'openai', model: 'gpt-4o-mini' });
  const tools = createAuthDesignerTools(model);
  const subagentTools = createSubagentToolSet([securityAnalyzerSubagent, flowDesignerSubagent], {
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
