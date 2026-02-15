/**
 * refine_schema tool - updates existing schema based on feedback (uses AI)
 */

import { z } from 'zod';
import type { Model } from '../../../lib/types/model';
import { defineTool } from '../../../lib/tools';
import { dataModelDesignSchema, type TDataModelDesign } from '../schemas';
import { buildRefineSchemaPrompt } from '../prompts';

function extractJson(text: string): string {
  const trimmed = text.trim();
  const codeBlock = /```(?:json)?\s*([\s\S]*?)```/.exec(trimmed);
  if (codeBlock?.[1]) return codeBlock[1].trim();
  return trimmed;
}

/**
 * Creates the refine_schema tool for iterating on an existing data model.
 */
export function createRefineSchemaTools(model: Model) {
  return defineTool({
    name: 'refine_schema',
    description:
      'Update an existing data model schema based on user feedback. Provide the current schema JSON and feedback describing desired changes.',
    input: z.object({
      existingSchema: z.string().describe('Current data model schema as JSON string'),
      feedback: z.string().describe('Feedback describing desired changes'),
    }),
    handler: async ({ existingSchema, feedback }): Promise<TDataModelDesign> => {
      const userPrompt = buildRefineSchemaPrompt(existingSchema, feedback);
      const messages = [
        {
          role: 'system' as const,
          content: 'You are a database schema expert. Return only valid JSON.',
        },
        { role: 'user' as const, content: userPrompt },
      ];
      const response = await model.invoke(messages, { temperature: 0.3, maxOutputTokens: 8192 });
      const jsonStr = extractJson(response.text);
      const parsed = JSON.parse(jsonStr) as unknown;
      return dataModelDesignSchema.parse(parsed);
    },
  });
}
