/**
 * runExpressBuilderAgent - orchestrator for Express.js project generation
 */

import { runAgent } from '../../lib/agents';
import { createModel } from '../../lib/models/create-model';
import { createToolSet } from '../../lib/tools';
import { createSubagentToolSet } from '../../lib/subagents';
import { EXPRESS_BUILDER_SYSTEM_PROMPT } from './prompts';
import { createExpressBuilderTools } from './tools';
import { routeGeneratorSubagent, middlewareConfiguratorSubagent } from './subagents';
import type { ExpressBuilderAgentConfig } from './types';
import type { AgentResult } from '../../lib/types/agent';

const ORCHESTRATOR_SYSTEM_PROMPT = `${EXPRESS_BUILDER_SYSTEM_PROMPT}

You are the Express builder orchestrator. When the user provides requirements:

1. **Generate routes**: Use subagent_route-generator to design route definitions from the API design.
2. **Configure middleware**: Use subagent_middleware-configurator to design the middleware stack.
3. **Generate config**: Use generate_express to produce the complete Express configuration as JSON.
4. **Validate**: Use validate_express to check the config JSON before returning.
5. **Scaffold (optional)**: If an output directory is provided, use scaffold_express to compile templates.

Respond with the final Express config as JSON.`;

/**
 * Run the express-builder orchestrator agent.
 */
export async function runExpressBuilderAgent(
  config: ExpressBuilderAgentConfig
): Promise<AgentResult> {
  const { input, model: modelConfig, maxIterations = 15, onStep, logger } = config;

  const model = createModel(modelConfig ?? { provider: 'openai', model: 'gpt-4o-mini' });
  const tools = createExpressBuilderTools(model);
  const subagentTools = createSubagentToolSet(
    [routeGeneratorSubagent, middlewareConfiguratorSubagent],
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
