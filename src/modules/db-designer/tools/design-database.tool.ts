/**
 * design_database tool - generates MongoDB schema from plain text requirement (uses AI)
 */

import { z } from 'zod';
import type { Model } from '../../../lib/types/model';
import { defineTool } from '../../../lib/tools';
import { projectSchema, type TBackendProjectSchema } from '../schemas';
import { createDbDesignPrompt } from '../prompts';
import { parseModelJsonResponse } from '../../../lib/utils';

/**
 * Creates the design_database tool. Requires a model to invoke for schema generation.
 */
export function createDesignDatabaseTool(model: Model) {
  return defineTool({
    name: 'design_database',
    description:
      'Generate a MongoDB database schema from plain text requirements. Use for ad-hoc or legacy requirements. Returns the full project schema as JSON.',
    input: z.object({
      requirement: z.string().describe('Plain text description of the database requirements'),
    }),
    handler: async ({ requirement }): Promise<TBackendProjectSchema> => {
      const userPrompt = createDbDesignPrompt(requirement);
      const messages = [
        {
          role: 'system' as const,
          content: 'You are a MongoDB schema expert. Return only valid JSON.',
        },
        { role: 'user' as const, content: userPrompt },
      ];
      const response = await model.invoke(messages, { temperature: 0.3, maxOutputTokens: 8192 });
      return parseModelJsonResponse(response.text, projectSchema);
    },
  });
}
