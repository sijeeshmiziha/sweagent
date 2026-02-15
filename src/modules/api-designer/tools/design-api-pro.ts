/**
 * design_api_pro tool - structured API design from data model + context (uses AI)
 */

import { z } from 'zod';
import type { Model } from '../../../lib/types/model';
import { defineTool } from '../../../lib/tools';
import { apiDesignSchema, type TApiDesign } from '../schemas';
import { buildProDesignApiPrompt } from '../prompts';
import { parseModelJsonResponse } from '../../../lib/utils';

/**
 * Creates the design_api_pro tool for structured API design.
 */
export function createDesignApiProTool(model: Model) {
  return defineTool({
    name: 'design_api_pro',
    description:
      'Generate a comprehensive API design from a data model and project context. Produces detailed endpoints with validation, error responses, and auth annotations.',
    input: z.object({
      projectName: z.string().describe('Project name'),
      apiStyle: z.enum(['rest', 'graphql']).describe('Target API style'),
      dataModel: z.string().describe('Data model JSON or description'),
      context: z.string().describe('Project context: features, actors, stories'),
    }),
    handler: async ({ projectName, apiStyle, dataModel, context }): Promise<TApiDesign> => {
      const userPrompt = buildProDesignApiPrompt(projectName, apiStyle, dataModel, context);
      const messages = [
        { role: 'system' as const, content: 'You are an API architect. Return only valid JSON.' },
        { role: 'user' as const, content: userPrompt },
      ];
      const response = await model.invoke(messages, { temperature: 0.2, maxOutputTokens: 16384 });
      return parseModelJsonResponse(response.text, apiDesignSchema);
    },
  });
}
