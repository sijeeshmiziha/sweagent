/**
 * requirement-validator subagent - validates completeness of requirements (has analyze_project_info tool)
 */

import { defineSubagent } from '../../../lib/subagents';
import { createAnalyzeProjectInfoTool } from '../tools/analyze-project-info.tool';
import type { Model } from '../../../lib/types/model';

const REQUIREMENT_VALIDATOR_SYSTEM_PROMPT = `You are a requirements completeness validator. Your job is to:

1. Use the analyze_project_info tool when the user provides project name, goal, and features to check if clarification is needed.
2. When the user provides the full pipeline output (actors, flows, stories, modules), review it for gaps: missing actors, incomplete flows, stories without dataInvolved, or modules missing CRUD APIs.
3. Report any gaps and suggest improvements.

When the user gives you project info, call analyze_project_info to get a structured analysis. When they give you full requirements JSON, analyze it and list gaps.`;

export function createRequirementValidatorSubagent(model: Model) {
  return defineSubagent({
    name: 'requirement-validator',
    description:
      'Validates completeness of requirements. Use when you have project info and want to check if clarification is needed, or when you have full actors/flows/stories/modules and want to check for gaps. Has access to analyze_project_info tool.',
    systemPrompt: REQUIREMENT_VALIDATOR_SYSTEM_PROMPT,
    tools: { analyze_project_info: createAnalyzeProjectInfoTool(model) },
    maxIterations: 5,
  });
}
