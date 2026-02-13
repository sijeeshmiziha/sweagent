/**
 * runDbDesignerAgent - orchestrator for the full DB design workflow
 */

import { runAgent } from '../../lib/agents';
import { createModel } from '../../lib/models/create-model';
import { createToolSet } from '../../lib/tools';
import { createSubagentToolSet } from '../../lib/subagents';
import { DB_DESIGN_SYSTEM_PROMPT } from './prompts';
import { createDbDesignerTools } from './tools';
import { entityAnalyzerSubagent, createSchemaRefinerSubagent } from './subagents';
import type { DbDesignerAgentConfig } from './types';
import type { AgentResult } from '../../lib/types/agent';

const ORCHESTRATOR_SYSTEM_PROMPT = `${DB_DESIGN_SYSTEM_PROMPT}

You are the database design orchestrator. When the user asks for a database design:

1. **Analyze first**: For complex or vague requirements, use subagent_entity-analyzer with a prompt that includes the user's requirements to get a structured analysis of entities, relationships, and roles.
2. **Generate schema**: Use design_database (for plain text requirements) or design_database_pro (when the user provides structured requirements: project name, goal, actors, flows, user stories with dataInvolved, technical requirements) to produce the MongoDB schema.
3. **Refine (optional)**: If the user wants validation or refinements, use subagent_schema-refiner with the current schema and requirements.
4. **Validate**: You can use validate_schema to check any schema JSON before returning.
5. **Redesign**: If the user asks for changes to an existing schema, use redesign_database with the existing schema string and their feedback.

Respond with the final schema (as JSON) or a clear summary and the schema.`;

/**
 * Run the db-designer orchestrator agent with all tools and subagents.
 */
export async function runDbDesignerAgent(config: DbDesignerAgentConfig): Promise<AgentResult> {
  const { input, model: modelConfig, maxIterations = 15, onStep } = config;

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
  });
}
