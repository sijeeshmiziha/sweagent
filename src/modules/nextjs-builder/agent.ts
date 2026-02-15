/**
 * runNextjsBuilderAgent - orchestrator for Next.js project generation
 */

import { runAgent } from '../../lib/agents';
import { createModel } from '../../lib/models/create-model';
import { createToolSet } from '../../lib/tools';
import { createSubagentToolSet } from '../../lib/subagents';
import { NEXTJS_BUILDER_SYSTEM_PROMPT } from './prompts';
import { createNextjsBuilderTools } from './tools';
import { routePlannerSubagent, apiRouteGeneratorSubagent } from './subagents';
import type { NextjsBuilderAgentConfig } from './types';
import type { AgentResult } from '../../lib/types/agent';

const ORCHESTRATOR_SYSTEM_PROMPT = `${NEXTJS_BUILDER_SYSTEM_PROMPT}

You are the Next.js builder orchestrator. When the user provides requirements:

1. **Plan routes**: Use subagent_route-planner to design the App Router file structure with route groups and layouts.
2. **Generate API routes**: Use subagent_api-route-generator to design API route handlers and server actions.
3. **Generate config**: Use generate_nextjs to produce the complete Next.js configuration as JSON.
4. **Validate**: Use validate_nextjs to check the config JSON before returning.

Respond with the final Next.js config as JSON.`;

/**
 * Run the nextjs-builder orchestrator agent.
 */
export async function runNextjsBuilderAgent(
  config: NextjsBuilderAgentConfig
): Promise<AgentResult> {
  const { input, model: modelConfig, maxIterations = 15, onStep, logger } = config;

  const model = createModel(modelConfig ?? { provider: 'openai', model: 'gpt-4o-mini' });
  const tools = createNextjsBuilderTools(model);
  const subagentTools = createSubagentToolSet([routePlannerSubagent, apiRouteGeneratorSubagent], {
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
