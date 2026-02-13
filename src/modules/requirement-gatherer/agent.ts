/**
 * runRequirementGathererAgent - orchestrator for the requirements pipeline (InfoProcessing, UsersFinding, Flows, Stories, Modules)
 */

import { runAgent } from '../../lib/agents';
import { createModel } from '../../lib/models/create-model';
import { createToolSet } from '../../lib/tools';
import { createSubagentToolSet } from '../../lib/subagents';
import { REQUIREMENT_GATHERER_SYSTEM_PROMPT } from './prompts';
import { createRequirementGathererTools } from './tools';
import { infoProcessorSubagent, createRequirementValidatorSubagent } from './subagents';
import type { RequirementGathererAgentConfig } from './types';
import type { AgentResult } from '../../lib/types/agent';

const ORCHESTRATOR_SYSTEM_PROMPT = `${REQUIREMENT_GATHERER_SYSTEM_PROMPT}

You are the requirement gatherer orchestrator. When the user provides project information (name, goal, features) or a natural language description:

1. **Analyze (optional)**: For vague or complex input, use subagent_info-processor with a prompt describing the project to get a structured analysis and suggested follow-up questions.
2. **Pipeline**: Run the 5-step pipeline in order:
   - analyze_project_info: Check if clarification is needed (projectName, projectGoal, projectFeatures).
   - extract_actors: Get user types from project info.
   - generate_flows: Pass project info and the actors JSON string to get flows.
   - generate_stories: Pass project info, actors JSON, and flows JSON to get user stories.
   - extract_modules: Pass project info, actors, flows, and stories JSON to get modules and CRUD APIs.
3. **Validate (optional)**: Use subagent_requirement-validator to validate completeness of the full output or to check if more clarification is needed.
4. **Respond**: Return a clear summary and the structured requirements (actors, flows, stories, modules). You may return JSON or a formatted summary.

If the user input is a single paragraph, first parse or infer projectName, projectGoal, and projectFeatures, then run analyze_project_info. Proceed with the pipeline when clarification is not needed.`;

/**
 * Run the requirement-gatherer orchestrator agent with all tools and subagents.
 */
export async function runRequirementGathererAgent(
  config: RequirementGathererAgentConfig
): Promise<AgentResult> {
  const { input, model: modelConfig, maxIterations = 15, onStep } = config;

  const model = createModel(modelConfig ?? { provider: 'openai', model: 'gpt-4o-mini' });
  const reqTools = createRequirementGathererTools(model);
  const requirementValidator = createRequirementValidatorSubagent(model);
  const subagentTools = createSubagentToolSet([infoProcessorSubagent, requirementValidator], {
    parentModel: model,
  });
  const tools = createToolSet({ ...reqTools, ...subagentTools });

  return runAgent({
    model,
    tools,
    systemPrompt: ORCHESTRATOR_SYSTEM_PROMPT,
    input,
    maxIterations,
    onStep,
  });
}
