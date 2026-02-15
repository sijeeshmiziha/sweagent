/**
 * runDataModelerAgent - orchestrator for data model design
 */

import { runAgent } from '../../lib/agents';
import { createModel } from '../../lib/models/create-model';
import { createToolSet } from '../../lib/tools';
import { createSubagentToolSet } from '../../lib/subagents';
import { DATA_MODELER_SYSTEM_PROMPT } from './prompts';
import { createDataModelerTools } from './tools';
import {
  entityAnalyzerSubagent,
  relationshipMapperSubagent,
  createSchemaRefinerSubagent,
} from './subagents';
import type { DataModelerAgentConfig } from './types';
import type { AgentResult } from '../../lib/types/agent';

const ORCHESTRATOR_SYSTEM_PROMPT = `${DATA_MODELER_SYSTEM_PROMPT}

You are the data modeling orchestrator. When the user asks for a data model:

1. **Analyze first**: Use subagent_entity-analyzer to extract entities, fields, and relationships from the requirements.
2. **Map relationships**: Use subagent_relationship-mapper with the entity analysis to determine cardinality, foreign keys, and indexes.
3. **Generate schema**: Use design_schema (plain text) or design_schema_pro (when structured context is available) to produce the data model.
4. **Refine (optional)**: Use subagent_schema-refiner to validate and suggest improvements to the generated schema.
5. **Validate**: Use validate_data_model to check the final schema JSON before returning.

Respond with the final data model schema as JSON.`;

/**
 * Run the data-modeler orchestrator agent with all tools and subagents.
 */
export async function runDataModelerAgent(config: DataModelerAgentConfig): Promise<AgentResult> {
  const { input, model: modelConfig, maxIterations = 15, onStep, logger } = config;

  const model = createModel(modelConfig ?? { provider: 'openai', model: 'gpt-4o-mini' });
  const tools = createDataModelerTools(model);
  const schemaRefiner = createSchemaRefinerSubagent();
  const subagentTools = createSubagentToolSet(
    [entityAnalyzerSubagent, relationshipMapperSubagent, schemaRefiner],
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
