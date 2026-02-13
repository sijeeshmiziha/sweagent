/**
 * analyze_project_info tool - analyzes project info and determines if clarification is needed (InfoProcessing)
 */

import { z } from 'zod';
import type { Model } from '../../../lib/types/model';
import { defineTool } from '../../../lib/tools';
import { projectAnalysisSchema, type ProjectAnalysis } from '../schemas';
import { REQUIREMENT_GATHERER_SYSTEM_PROMPT, ANALYZE_BASIC_INFO_PROMPT } from '../prompts';

function extractJson(text: string): string {
  const trimmed = text.trim();
  const codeBlock = /```(?:json)?\s*([\s\S]*?)```/.exec(trimmed);
  if (codeBlock?.[1]) return codeBlock[1].trim();
  return trimmed;
}

export function createAnalyzeProjectInfoTool(model: Model) {
  return defineTool({
    name: 'analyze_project_info',
    description:
      'Analyze project name, goal, and features to determine if clarification is needed for user stories. Returns needsClarification, questions, conversationalMessage, and projectAnalysis.',
    input: z.object({
      projectName: z.string().describe('Project name'),
      projectGoal: z.string().describe('Project goal'),
      projectFeatures: z.string().describe('Features or requirements description'),
    }),
    handler: async ({ projectName, projectGoal, projectFeatures }): Promise<ProjectAnalysis> => {
      const prompt = ANALYZE_BASIC_INFO_PROMPT.replace('{projectName}', projectName)
        .replace('{projectGoal}', projectGoal)
        .replace('{projectFeatures}', projectFeatures);
      const messages = [
        { role: 'system' as const, content: REQUIREMENT_GATHERER_SYSTEM_PROMPT },
        { role: 'user' as const, content: prompt },
      ];
      const response = await model.invoke(messages, {
        temperature: 0.4,
        maxOutputTokens: 4096,
      });
      const jsonStr = extractJson(response.text);
      const parsed = JSON.parse(jsonStr) as unknown;
      return projectAnalysisSchema.parse(parsed);
    },
  });
}
