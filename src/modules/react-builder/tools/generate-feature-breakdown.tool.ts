/**
 * generate_feature_breakdown tool - breaks down GraphQL schema into components/pages (uses AI)
 */

import { z } from 'zod';
import type { Model } from '../../../lib/types/model';
import { defineTool } from '../../../lib/tools';
import { REACT_BUILDER_INSTRUCTION } from '../prompts/instruction.prompt';

export interface FeatureBreakdownResult {
  summary: string;
  modules: string[];
  operations: string[];
  suggestedPages?: string[];
}

export function createGenerateFeatureBreakdownTool(model: Model) {
  return defineTool({
    name: 'generate_feature_breakdown',
    description:
      'Analyze a GraphQL schema and produce a feature/component breakdown: list of modules, CRUD operations, and suggested pages. Returns a structured summary (not the full frontend JSON).',
    input: z.object({
      graphqlSchema: z.string().describe('The GraphQL schema string to analyze'),
    }),
    handler: async ({ graphqlSchema }): Promise<FeatureBreakdownResult> => {
      const userPrompt = `${REACT_BUILDER_INSTRUCTION}

**Schema to analyze:**
\`\`\`graphql
${graphqlSchema}
\`\`\`

Respond with a structured breakdown only (no full JSON config): list modules, list Query/Mutation operations, and suggested pages for each module. Use clear headings and bullet points.`;
      const messages = [
        {
          role: 'system' as const,
          content: 'You are a GraphQL schema analyst. Return a clear, structured text breakdown.',
        },
        { role: 'user' as const, content: userPrompt },
      ];
      const response = await model.invoke(messages, { temperature: 0.3, maxOutputTokens: 4096 });
      return { summary: response.text, modules: [], operations: [], suggestedPages: [] };
    },
  });
}
