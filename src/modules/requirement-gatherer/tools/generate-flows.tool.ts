/**
 * generate_flows tool - generates user flows per actor (Flows)
 */

import { z } from 'zod';
import type { Model } from '../../../lib/types/model';
import { defineTool } from '../../../lib/tools';
import { flowsResultSchema, type FlowsResult } from '../schemas';
import { REQUIREMENT_GATHERER_SYSTEM_PROMPT, GENERATE_FLOWS_PROMPT } from '../prompts';

function extractJson(text: string): string {
  const trimmed = text.trim();
  const codeBlock = /```(?:json)?\s*([\s\S]*?)```/.exec(trimmed);
  if (codeBlock?.[1]) return codeBlock[1].trim();
  return trimmed;
}

export function createGenerateFlowsTool(model: Model) {
  return defineTool({
    name: 'generate_flows',
    description:
      'Generate user journeys/flows for each actor. Input: project info and JSON string of actors. Returns flows array and message.',
    input: z.object({
      projectName: z.string().describe('Project name'),
      projectGoal: z.string().describe('Project goal'),
      projectFeatures: z.string().describe('Features or requirements description'),
      actors: z.string().describe('JSON string of actors array from extract_actors'),
    }),
    handler: async ({
      projectName,
      projectGoal,
      projectFeatures,
      actors,
    }): Promise<FlowsResult> => {
      const prompt = GENERATE_FLOWS_PROMPT.replace('{projectName}', projectName)
        .replace('{projectGoal}', projectGoal)
        .replace('{projectFeatures}', projectFeatures)
        .replace('{actors}', actors);
      const messages = [
        { role: 'system' as const, content: REQUIREMENT_GATHERER_SYSTEM_PROMPT },
        { role: 'user' as const, content: prompt },
      ];
      const response = await model.invoke(messages, {
        temperature: 0.4,
        maxOutputTokens: 8192,
      });
      const jsonStr = extractJson(response.text);
      const parsed = JSON.parse(jsonStr) as unknown;
      return flowsResultSchema.parse(parsed);
    },
  });
}
