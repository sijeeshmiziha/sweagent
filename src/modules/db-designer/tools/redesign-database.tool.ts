/**
 * redesign_database tool - updates existing schema based on user feedback (uses AI)
 */

import { z } from 'zod';
import type { Model } from '../../../lib/types/model';
import { defineTool } from '../../../lib/tools';
import { projectSchema, type TBackendProjectSchema } from '../schemas';
import { createRedesignPrompt } from '../prompts';

function extractJson(text: string): string {
  const trimmed = text.trim();
  const codeBlock = /```(?:json)?\s*([\s\S]*?)```/.exec(trimmed);
  if (codeBlock?.[1]) return codeBlock[1].trim();
  return trimmed;
}

/**
 * Creates the redesign_database tool. Requires a model for schema update.
 */
export function createRedesignDatabaseTool(model: Model) {
  return defineTool({
    name: 'redesign_database',
    description:
      'Update an existing MongoDB project schema based on user feedback. Provide the current schema JSON string and the feedback. Returns the updated schema as JSON.',
    input: z.object({
      existingSchema: z.string().describe('Current project schema as JSON string'),
      feedback: z.string().describe('User feedback describing desired changes'),
    }),
    handler: async ({ existingSchema, feedback }): Promise<TBackendProjectSchema> => {
      const userPrompt = createRedesignPrompt(existingSchema, feedback);
      const messages = [
        {
          role: 'system' as const,
          content: 'You are a MongoDB schema expert. Return only valid JSON.',
        },
        { role: 'user' as const, content: userPrompt },
      ];
      const response = await model.invoke(messages, { temperature: 0.3, maxOutputTokens: 8192 });
      const jsonStr = extractJson(response.text);
      const parsed = JSON.parse(jsonStr) as unknown;
      return projectSchema.parse(parsed);
    },
  });
}
