/**
 * design_backend tool - generates backend architecture from requirements (uses AI)
 */

import { z } from 'zod';
import type { Model } from '../../../lib/types/model';
import { defineTool } from '../../../lib/tools';
import { backendDesignSchema, type TBackendDesign } from '../schemas';
import { buildDesignBackendPrompt } from '../prompts';

function extractJson(text: string): string {
  const trimmed = text.trim();
  const codeBlock = /```(?:json)?\s*([\s\S]*?)```/.exec(trimmed);
  if (codeBlock?.[1]) return codeBlock[1].trim();
  return trimmed;
}

/**
 * Creates the design_backend tool for backend architecture generation.
 */
export function createDesignBackendTool(model: Model) {
  return defineTool({
    name: 'design_backend',
    description:
      'Generate a complete backend architecture design from requirements. Returns framework, services, middleware, routes, and folder structure as JSON.',
    input: z.object({
      requirement: z.string().describe('Data model, API design, and project requirements'),
    }),
    handler: async ({ requirement }): Promise<TBackendDesign> => {
      const userPrompt = buildDesignBackendPrompt(requirement);
      const messages = [
        {
          role: 'system' as const,
          content: 'You are a backend architect. Return only valid JSON.',
        },
        { role: 'user' as const, content: userPrompt },
      ];
      const response = await model.invoke(messages, {
        temperature: 0.3,
        maxOutputTokens: 16384,
      });
      const jsonStr = extractJson(response.text);
      const parsed = JSON.parse(jsonStr) as unknown;
      return backendDesignSchema.parse(parsed);
    },
  });
}
