/**
 * extract_modules tool - extracts modules and CRUD APIs from stories (Modules)
 */

import { z } from 'zod';
import type { Model } from '../../../lib/types/model';
import { defineTool } from '../../../lib/tools';
import { modulesResultSchema, type ModulesResult } from '../schemas';
import { REQUIREMENT_GATHERER_SYSTEM_PROMPT, EXTRACT_MODULES_PROMPT } from '../prompts';

function extractJson(text: string): string {
  const trimmed = text.trim();
  const codeBlock = /```(?:json)?\s*([\s\S]*?)```/.exec(trimmed);
  if (codeBlock?.[1]) return codeBlock[1].trim();
  return trimmed;
}

export function createExtractModulesTool(model: Model) {
  return defineTool({
    name: 'extract_modules',
    description:
      'Extract application modules and CRUD APIs from actors, flows, and stories. Input: project info and JSON strings of actors, flows, stories. Returns modules array, summary, and message.',
    input: z.object({
      projectName: z.string().describe('Project name'),
      projectGoal: z.string().describe('Project goal'),
      projectFeatures: z.string().describe('Features or requirements description'),
      actors: z.string().describe('JSON string of actors array'),
      flows: z.string().describe('JSON string of flows array'),
      stories: z.string().describe('JSON string of stories array from generate_stories'),
    }),
    handler: async ({
      projectName,
      projectGoal,
      projectFeatures,
      actors,
      flows,
      stories,
    }): Promise<ModulesResult> => {
      const prompt = EXTRACT_MODULES_PROMPT.replace('{projectName}', projectName)
        .replace('{projectGoal}', projectGoal)
        .replace('{projectFeatures}', projectFeatures)
        .replace('{actors}', actors)
        .replace('{flows}', flows)
        .replace('{stories}', stories);
      const messages = [
        { role: 'system' as const, content: REQUIREMENT_GATHERER_SYSTEM_PROMPT },
        { role: 'user' as const, content: prompt },
      ];
      const response = await model.invoke(messages, {
        temperature: 0.4,
        maxOutputTokens: 16384,
      });
      const jsonStr = extractJson(response.text);
      const parsed = JSON.parse(jsonStr) as unknown;
      return modulesResultSchema.parse(parsed);
    },
  });
}
