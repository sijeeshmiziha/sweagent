/**
 * design_api tool - generates API design from plain text requirements (uses AI)
 */

import { z } from 'zod';
import type { Model } from '../../../lib/types/model';
import { defineTool } from '../../../lib/tools';
import { apiDesignSchema, type TApiDesign } from '../schemas';
import { buildDesignApiPrompt } from '../prompts';
import { parseModelJsonResponse } from '../../../lib/utils';

/**
 * Creates the design_api tool for plain text requirements.
 */
export function createDesignApiTool(model: Model) {
  return defineTool({
    name: 'design_api',
    description:
      'Generate an API design (REST or GraphQL) from plain text requirements. Returns the full API design as JSON.',
    input: z.object({
      requirement: z.string().describe('Plain text description of the API requirements'),
    }),
    handler: async ({ requirement }): Promise<TApiDesign> => {
      const userPrompt = buildDesignApiPrompt(requirement);
      const messages = [
        { role: 'system' as const, content: 'You are an API architect. Return only valid JSON.' },
        { role: 'user' as const, content: userPrompt },
      ];
      const response = await model.invoke(messages, { temperature: 0.3, maxOutputTokens: 16384 });
      return parseModelJsonResponse(response.text, apiDesignSchema);
    },
  });
}
