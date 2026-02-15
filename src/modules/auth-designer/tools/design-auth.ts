/**
 * design_auth tool - generates auth design from requirements (uses AI)
 */

import { z } from 'zod';
import type { Model } from '../../../lib/types/model';
import { defineTool } from '../../../lib/tools';
import { authDesignSchema, type TAuthDesign } from '../schemas';
import { buildDesignAuthPrompt } from '../prompts';
import { parseModelJsonResponse } from '../../../lib/utils';

/**
 * Creates the design_auth tool for auth flow generation.
 */
export function createDesignAuthTool(model: Model) {
  return defineTool({
    name: 'design_auth',
    description:
      'Generate a complete authentication and authorization design from project requirements. Returns auth flows, middleware, roles, and security policies as JSON.',
    input: z.object({
      requirement: z.string().describe('Project context and auth requirements'),
    }),
    handler: async ({ requirement }): Promise<TAuthDesign> => {
      const userPrompt = buildDesignAuthPrompt(requirement);
      const messages = [
        {
          role: 'system' as const,
          content: 'You are a security engineer. Return only valid JSON.',
        },
        { role: 'user' as const, content: userPrompt },
      ];
      const response = await model.invoke(messages, { temperature: 0.3, maxOutputTokens: 8192 });
      return parseModelJsonResponse(response.text, authDesignSchema);
    },
  });
}
