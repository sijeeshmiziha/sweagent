/**
 * runDbDesignerAgent - MongoDB-specific orchestrator (merged from db-designer)
 */

import { runAgent } from '../../lib/agents';
import { createModel } from '../../lib/models/create-model';
import { createToolSet } from '../../lib/tools';
import { createSubagentToolSet } from '../../lib/subagents';
import { MONGODB_SYSTEM_PROMPT } from './prompts';
import { createDbDesignerTools } from './tools';
import { entityAnalyzerSubagent, createSchemaRefinerSubagent } from './subagents';
import type { MongoDbDesignerAgentConfig } from './types';
import type { AgentResult } from '../../lib/types/agent';

const ORCHESTRATOR_SYSTEM_PROMPT = `${MONGODB_SYSTEM_PROMPT}

You are the MongoDB database design orchestrator. When the user asks for a database design:

1. **Analyze first**: Use subagent_entity-analyzer to extract entities, relationships, and roles.
2. **Generate schema**: Use design_database (plain text) or design_database_pro (structured requirements) to produce the MongoDB schema.
3. **Refine (optional)**: Use subagent_schema-refiner to validate and suggest improvements.
4. **Validate**: Use validate_schema to check the final schema JSON.
5. **Redesign**: If changes are requested, use redesign_database with existing schema and feedback.

Respond with the final schema as JSON.`;

/**
 * Run the MongoDB db-designer orchestrator agent with all tools and subagents.
 */
export async function runDbDesignerAgent(config: MongoDbDesignerAgentConfig): Promise<AgentResult> {
  const { input, model: modelConfig, maxIterations = 15, onStep, logger } = config;

  const model = createModel(modelConfig ?? { provider: 'openai', model: 'gpt-4o-mini' });
  const dbTools = createDbDesignerTools(model);
  const schemaRefiner = createSchemaRefinerSubagent();
  const subagentTools = createSubagentToolSet([entityAnalyzerSubagent, schemaRefiner], {
    parentModel: model,
  });
  const tools = createToolSet({ ...dbTools, ...subagentTools });

  return runAgent({
    model,
    tools,
    systemPrompt: ORCHESTRATOR_SYSTEM_PROMPT,
    input,
    maxIterations,
    onStep,
    logger,
  });
}
