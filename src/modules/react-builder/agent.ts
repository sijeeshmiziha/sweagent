/**
 * runReactBuilderAgent - orchestrator for frontend config generation with retry and subagents
 */

import { runAgent } from '../../lib/agents';
import { createModel } from '../../lib/models/create-model';
import { createToolSet } from '../../lib/tools';
import { createSubagentToolSet } from '../../lib/subagents';
import { REACT_BUILDER_SYSTEM_PROMPT } from './prompts';
import { createReactBuilderTools } from './tools';
import { graphqlAnalyzerSubagent, createConfigValidatorSubagent } from './subagents';
import type { ReactBuilderAgentConfig } from './types';
import type { AgentResult } from '../../lib/types/agent';

const ORCHESTRATOR_SYSTEM_PROMPT = `${REACT_BUILDER_SYSTEM_PROMPT}

You are the React frontend builder orchestrator. When the user provides a GraphQL schema and asks for a frontend configuration:

1. **Analyze (optional)**: For complex schemas, use subagent_graphql-analyzer with a prompt that includes the schema to get a structured analysis of types, queries, and mutations.
2. **Generate**: Use generate_frontend with the GraphQL schema (and optional appInfo) to produce the frontend config JSON.
3. **Validate (optional)**: Use subagent_config-validator with the generated config (and schema) to check structure and completeness.
4. **Validate directly**: You can use validate_frontend_config to check any config JSON.
5. **Feature breakdown**: Use generate_feature_breakdown to get a module/operation breakdown before generating.

Respond with the final frontend config (as JSON) or a clear summary and the config. If the user gives feedback, use generate_frontend again with the same schema and consider their feedback in your instructions.`;

/**
 * Run the react-builder orchestrator agent with all tools and subagents.
 * Use generate_frontend tool for config generation; the tool may throw on parse failure (caller can retry with new input).
 */
export async function runReactBuilderAgent(config: ReactBuilderAgentConfig): Promise<AgentResult> {
  const {
    input,
    model: modelConfig,
    maxIterations = 15,
    onStep,
  } = config;

  const model = createModel(modelConfig ?? { provider: 'openai', model: 'gpt-4o-mini' });
  const reactTools = createReactBuilderTools(model);
  const configValidator = createConfigValidatorSubagent();
  const subagentTools = createSubagentToolSet([graphqlAnalyzerSubagent, configValidator], {
    parentModel: model,
  });
  const tools = createToolSet({ ...reactTools, ...subagentTools });

  return runAgent({
    model,
    tools,
    systemPrompt: ORCHESTRATOR_SYSTEM_PROMPT,
    input,
    maxIterations,
    onStep,
  });
}
