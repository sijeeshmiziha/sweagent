/**
 * extract_actors tool - identifies user types/actors (UsersFinding)
 */

import { z } from 'zod';
import type { Model } from '../../../lib/types/model';
import { defineTool } from '../../../lib/tools';
import { actorsResultSchema, type ActorResult } from '../schemas';
import { REQUIREMENT_GATHERER_SYSTEM_PROMPT, EXTRACT_ACTORS_PROMPT } from '../prompts';

function extractJson(text: string): string {
  const trimmed = text.trim();
  const codeBlock = /```(?:json)?\s*([\s\S]*?)```/.exec(trimmed);
  if (codeBlock?.[1]) return codeBlock[1].trim();
  return trimmed;
}

export function createExtractActorsTool(model: Model) {
  return defineTool({
    name: 'extract_actors',
    description:
      'Identify all user types (actors) who will interact with the system from project name, goal, and features. Returns actors array and message.',
    input: z.object({
      projectName: z.string().describe('Project name'),
      projectGoal: z.string().describe('Project goal'),
      projectFeatures: z.string().describe('Features or requirements description'),
    }),
    handler: async ({ projectName, projectGoal, projectFeatures }): Promise<ActorResult> => {
      const prompt = EXTRACT_ACTORS_PROMPT.replace('{projectName}', projectName)
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
      return actorsResultSchema.parse(parsed);
    },
  });
}
