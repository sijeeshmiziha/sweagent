/**
 * generate_nextjs tool - generates Next.js config from requirements (uses AI)
 */

import { z } from 'zod';
import type { Model } from '../../../lib/types/model';
import { defineTool } from '../../../lib/tools';
import { nextjsConfigSchema, type TNextjsConfig } from '../schemas';
import { buildDesignNextjsPrompt } from '../prompts';
import { parseModelJsonResponse } from '../../../lib/utils';

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
      return parseModelJsonResponse(response.text, nextjsConfigSchema);
    },
  });
}
