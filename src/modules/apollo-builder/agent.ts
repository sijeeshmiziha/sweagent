/**
 * runApolloBuilderAgent - orchestrator for Apollo GraphQL subgraph generation
 */

import { runAgent } from '../../lib/agents';
import { createModel } from '../../lib/models/create-model';
import { createToolSet } from '../../lib/tools';
import { createSubagentToolSet } from '../../lib/subagents';
import { APOLLO_BUILDER_SYSTEM_PROMPT } from './prompts';
import { createApolloBuilderTools } from './tools';
import { schemaGeneratorSubagent, resolverPlannerSubagent } from './subagents';
import type { ApolloBuilderAgentConfig } from './types';
import type { AgentResult } from '../../lib/types/agent';

const SCAFFOLD_STEP =
  '\n5. **Scaffold (optional)**: If an output directory is provided, use scaffold_subgraph to compile templates.';

function buildOrchestratorPrompt(disableScaffold?: boolean): string {
  return `${APOLLO_BUILDER_SYSTEM_PROMPT}

You are the Apollo subgraph builder orchestrator. When the user provides requirements:

1. **Generate schema**: Use subagent_schema-generator to create GraphQL type definitions from the data model.
2. **Plan resolvers**: Use subagent_resolver-planner to design resolver implementations per module.
3. **Generate config**: Use generate_subgraph to produce the complete subgraph configuration as JSON.
4. **Validate**: Use validate_subgraph to check the config JSON before returning.${disableScaffold ? '' : SCAFFOLD_STEP}

Respond with the final subgraph config as JSON.`;
}

/**
 * Run the apollo-builder orchestrator agent.
 */
export async function runApolloBuilderAgent(
  config: ApolloBuilderAgentConfig
): Promise<AgentResult> {
  const { input, model: modelConfig, maxIterations = 15, onStep, logger, disableScaffold } = config;

  const model = createModel(modelConfig ?? { provider: 'openai', model: 'gpt-4o-mini' });
  const tools = createApolloBuilderTools(model, { disableScaffold });
  const subagentTools = createSubagentToolSet([schemaGeneratorSubagent, resolverPlannerSubagent], {
    parentModel: model,
  });
  const allTools = createToolSet({ ...tools, ...subagentTools });

  return runAgent({
    model,
    tools: allTools,
    systemPrompt: buildOrchestratorPrompt(disableScaffold),
    input,
    maxIterations,
    onStep,
    logger,
  });
}
