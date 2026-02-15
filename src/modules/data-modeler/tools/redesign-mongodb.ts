/**
 * redesign_database tool - updates existing MongoDB schema from feedback (merged from db-designer)
 */

import { z } from 'zod';
import type { Model } from '../../../lib/types/model';
import { defineTool } from '../../../lib/tools';
import { mongoProjectSchema, type TMongoProjectSchema } from '../schemas';
import { createMongoRedesignPrompt } from '../prompts';
import { parseModelJsonResponse } from '../../../lib/utils';

/**
 * Creates the redesign_database tool for iterating on MongoDB schemas.
 */
export function createRedesignDatabaseTool(model: Model) {
  return defineTool({
    name: 'redesign_database',
    description:
      'Update an existing MongoDB project schema based on user feedback. Provide the current schema JSON string and the feedback.',
    input: z.object({
      existingSchema: z.string().describe('Current project schema as JSON string'),
      feedback: z.string().describe('User feedback describing desired changes'),
    }),
    handler: async ({ existingSchema, feedback }): Promise<TMongoProjectSchema> => {
      const userPrompt = createMongoRedesignPrompt(existingSchema, feedback);
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
