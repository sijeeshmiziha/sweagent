/**
 * generate_subgraph tool - generates subgraph config from requirements (uses AI)
 */

import { z } from 'zod';
import type { Model } from '../../../lib/types/model';
import { defineTool } from '../../../lib/tools';
import { subgraphConfigSchema, type TSubgraphConfig } from '../schemas';
import { buildDesignSubgraphPrompt } from '../prompts';

function extractJson(text: string): string {
  const trimmed = text.trim();
  const codeBlock = /```(?:json)?\s*([\s\S]*?)```/.exec(trimmed);
  if (codeBlock?.[1]) return codeBlock[1].trim();
  return trimmed;
}

/**
 * Creates the generate_subgraph tool for Apollo subgraph config generation.
 */
export function createGenerateSubgraphTool(model: Model) {
  return defineTool({
    name: 'generate_subgraph',
    description:
      'Generate a complete Apollo GraphQL subgraph configuration from data model and API design. Returns modules, types, operations, and datasources as JSON.',
    input: z.object({
      requirement: z.string().describe('Data model, API design, and project requirements'),
    }),
    handler: async ({ requirement }): Promise<TSubgraphConfig> => {
      const userPrompt = buildDesignSubgraphPrompt(requirement);
      const messages = [
        {
          role: 'system' as const,
          content: 'You are an Apollo GraphQL architect. Return only valid JSON.',
        },
        { role: 'user' as const, content: userPrompt },
      ];
      const response = await model.invoke(messages, {
        temperature: 0.3,
        maxOutputTokens: 16384,
      });
      const jsonStr = extractJson(response.text);
      const parsed = JSON.parse(jsonStr) as unknown;
      return subgraphConfigSchema.parse(parsed);
    },
  });
}
