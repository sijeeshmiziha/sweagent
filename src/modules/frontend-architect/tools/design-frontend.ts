/**
 * design_frontend tool - generates frontend architecture from requirements (uses AI)
 */

import { z } from 'zod';
import type { Model } from '../../../lib/types/model';
import { defineTool } from '../../../lib/tools';
import { frontendDesignSchema, type TFrontendDesign } from '../schemas';
import { buildDesignFrontendPrompt } from '../prompts';

function extractJson(text: string): string {
  const trimmed = text.trim();
  const codeBlock = /```(?:json)?\s*([\s\S]*?)```/.exec(trimmed);
  if (codeBlock?.[1]) return codeBlock[1].trim();
  return trimmed;
}

/**
 * Creates the design_frontend tool for frontend architecture generation.
 */
export function createDesignFrontendTool(model: Model) {
  return defineTool({
    name: 'design_frontend',
    description:
      'Generate a complete frontend architecture design from project requirements. Returns pages, components, state management, and routing as JSON.',
    input: z.object({
      requirement: z.string().describe('Project context, API surface, and frontend requirements'),
    }),
    handler: async ({ requirement }): Promise<TFrontendDesign> => {
      const userPrompt = buildDesignFrontendPrompt(requirement);
      const messages = [
        {
          role: 'system' as const,
          content: 'You are a frontend architect. Return only valid JSON.',
        },
        { role: 'user' as const, content: userPrompt },
      ];
      const response = await model.invoke(messages, { temperature: 0.3, maxOutputTokens: 16384 });
      const jsonStr = extractJson(response.text);
      const parsed = JSON.parse(jsonStr) as unknown;
      return frontendDesignSchema.parse(parsed);
    },
  });
}
