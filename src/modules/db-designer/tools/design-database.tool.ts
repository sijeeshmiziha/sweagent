/**
 * design_database tool - generates MongoDB schema from plain text requirement (uses AI)
 */

import { z } from 'zod';
import type { Model } from '../../../lib/types/model';
import { defineTool } from '../../../lib/tools';
import { projectSchema, type TBackendProjectSchema } from '../schemas';
import { createDbDesignPrompt } from '../prompts';

function extractJson(text: string): string {
  const trimmed = text.trim();
  const codeBlock = /```(?:json)?\s*([\s\S]*?)```/.exec(trimmed);
  if (codeBlock?.[1]) return codeBlock[1].trim();
  return trimmed;
}

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
      const raw = response.text;
      const jsonStr = extractJson(raw);
      const parsed = JSON.parse(jsonStr) as unknown;
      return projectSchema.parse(parsed);
    },
  });
}
