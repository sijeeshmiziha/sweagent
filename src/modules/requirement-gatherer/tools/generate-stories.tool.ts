/**
 * generate_stories tool - generates user stories per flow (Stories)
 */

import { z } from 'zod';
import type { Model } from '../../../lib/types/model';
import { defineTool } from '../../../lib/tools';
import { storiesResultSchema, type StoriesResult } from '../schemas';
import { REQUIREMENT_GATHERER_SYSTEM_PROMPT, GENERATE_STORIES_PROMPT } from '../prompts';

function extractJson(text: string): string {
  const trimmed = text.trim();
  const codeBlock = /```(?:json)?\s*([\s\S]*?)```/.exec(trimmed);
  if (codeBlock?.[1]) return codeBlock[1].trim();
  return trimmed;
}

export function createGenerateStoriesTool(model: Model) {
  return defineTool({
    name: 'generate_stories',
    description:
      'Generate user stories for each flow. Input: project info, JSON string of actors, and JSON string of flows. Returns stories array and message.',
    input: z.object({
      projectName: z.string().describe('Project name'),
      projectGoal: z.string().describe('Project goal'),
      actors: z.string().describe('JSON string of actors array'),
      flows: z.string().describe('JSON string of flows array from generate_flows'),
    }),
    handler: async ({ projectName, projectGoal, actors, flows }): Promise<StoriesResult> => {
      const prompt = GENERATE_STORIES_PROMPT.replace('{projectName}', projectName)
        .replace('{projectGoal}', projectGoal)
        .replace('{actors}', actors)
        .replace('{flows}', flows);
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
      return storiesResultSchema.parse(parsed);
    },
  });
}
