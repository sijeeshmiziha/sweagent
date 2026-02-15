/**
 * generate_nextjs tool - generates Next.js config from requirements (uses AI)
 */

import { z } from 'zod';
import type { Model } from '../../../lib/types/model';
import { defineTool } from '../../../lib/tools';
import { nextjsConfigSchema, type TNextjsConfig } from '../schemas';
import { buildDesignNextjsPrompt } from '../prompts';

function extractJson(text: string): string {
  const trimmed = text.trim();
  const codeBlock = /```(?:json)?\s*([\s\S]*?)```/.exec(trimmed);
  if (codeBlock?.[1]) return codeBlock[1].trim();
  return trimmed;
}

/**
 * Creates the generate_nextjs tool for Next.js config generation.
 */
export function createGenerateNextjsTool(model: Model) {
  return defineTool({
    name: 'generate_nextjs',
    description:
      'Generate a complete Next.js App Router configuration from frontend design and requirements. Returns pages, layouts, API routes, server actions, and middleware as JSON.',
    input: z.object({
      requirement: z.string().describe('Frontend design, API design, and project requirements'),
    }),
    handler: async ({ requirement }): Promise<TNextjsConfig> => {
      const userPrompt = buildDesignNextjsPrompt(requirement);
      const messages = [
        {
          role: 'system' as const,
          content: 'You are a Next.js architect. Return only valid JSON.',
        },
        { role: 'user' as const, content: userPrompt },
      ];
      const response = await model.invoke(messages, {
        temperature: 0.3,
        maxOutputTokens: 16384,
      });
      const jsonStr = extractJson(response.text);
      const parsed = JSON.parse(jsonStr) as unknown;
      return nextjsConfigSchema.parse(parsed);
    },
  });
}
