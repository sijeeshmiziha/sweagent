/**
 * generate_express tool - generates Express config from requirements (uses AI)
 */

import { z } from 'zod';
import type { Model } from '../../../lib/types/model';
import { defineTool } from '../../../lib/tools';
import { expressConfigSchema, type TExpressConfig } from '../schemas';
import { buildDesignExpressPrompt } from '../prompts';

function extractJson(text: string): string {
  const trimmed = text.trim();
  const codeBlock = /```(?:json)?\s*([\s\S]*?)```/.exec(trimmed);
  if (codeBlock?.[1]) return codeBlock[1].trim();
  return trimmed;
}

/**
 * Creates the generate_express tool for Express config generation.
 */
export function createGenerateExpressTool(model: Model) {
  return defineTool({
    name: 'generate_express',
    description:
      'Generate a complete Express.js application configuration from data model and API design. Returns controllers, models, middleware, and routes as JSON.',
    input: z.object({
      requirement: z.string().describe('Data model, API design, and project requirements'),
    }),
    handler: async ({ requirement }): Promise<TExpressConfig> => {
      const userPrompt = buildDesignExpressPrompt(requirement);
      const messages = [
        {
          role: 'system' as const,
          content: 'You are an Express.js architect. Return only valid JSON.',
        },
        { role: 'user' as const, content: userPrompt },
      ];
      const response = await model.invoke(messages, {
        temperature: 0.3,
        maxOutputTokens: 16384,
      });
      const jsonStr = extractJson(response.text);
      const parsed = JSON.parse(jsonStr) as unknown;
      return expressConfigSchema.parse(parsed);
    },
  });
}
