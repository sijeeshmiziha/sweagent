/**
 * design_database tool - generates MongoDB schema from plain text (merged from db-designer)
 */

import { z } from 'zod';
import type { Model } from '../../../lib/types/model';
import { defineTool } from '../../../lib/tools';
import { mongoProjectSchema, type TMongoProjectSchema } from '../schemas';
import { createMongoDesignPrompt } from '../prompts';
import { parseModelJsonResponse } from '../../../lib/utils';

/**
 * Creates the design_database tool for MongoDB schema generation.
 */
export function createDesignDatabaseTool(model: Model) {
  return defineTool({
    name: 'design_database',
    description:
      'Generate a MongoDB database schema from plain text requirements. Returns the full project schema as JSON.',
    input: z.object({
      requirement: z.string().describe('Plain text description of the database requirements'),
    }),
    handler: async ({ requirement }): Promise<TMongoProjectSchema> => {
      const userPrompt = createMongoDesignPrompt(requirement);
      const messages = [
        {
          role: 'system' as const,
          content: 'You are a MongoDB schema expert. Return only valid JSON.',
        },
        { role: 'user' as const, content: userPrompt },
      ];
      const response = await model.invoke(messages, { temperature: 0.3, maxOutputTokens: 8192 });
      return parseModelJsonResponse(response.text, mongoProjectSchema);
    },
  });
}
