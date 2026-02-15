/**
 * design_schema tool - generates data model from plain text requirements (uses AI)
 */

import { z } from 'zod';
import type { Model } from '../../../lib/types/model';
import { defineTool } from '../../../lib/tools';
import { dataModelDesignSchema, type TDataModelDesign } from '../schemas';
import { buildDesignSchemaPrompt } from '../prompts';
import { parseModelJsonResponse } from '../../../lib/utils';

/**
 * Creates the design_schema tool. Requires a model for generation.
 */
export function createDesignSchemaTool(model: Model) {
  return defineTool({
    name: 'design_schema',
    description:
      'Generate a database schema (MongoDB or PostgreSQL) from plain text requirements. Returns the full data model as JSON.',
    input: z.object({
      requirement: z.string().describe('Plain text description of the data modeling requirements'),
    }),
    handler: async ({ requirement }): Promise<TDataModelDesign> => {
      const userPrompt = buildDesignSchemaPrompt(requirement);
      const messages = [
        {
          role: 'system' as const,
          content: 'You are a database schema expert. Return only valid JSON.',
        },
        { role: 'user' as const, content: userPrompt },
      ];
      const response = await model.invoke(messages, { temperature: 0.3, maxOutputTokens: 8192 });
      return parseModelJsonResponse(response.text, dataModelDesignSchema);
    },
  });
}
