/**
 * design_schema_pro tool - 5-phase structured data modeling (uses AI)
 */

import { z } from 'zod';
import type { Model } from '../../../lib/types/model';
import { defineTool } from '../../../lib/tools';
import { dataModelDesignSchema, type TDataModelDesign } from '../schemas';
import { buildProDesignPrompt } from '../prompts';

function extractJson(text: string): string {
  const trimmed = text.trim();
  const codeBlock = /```(?:json)?\s*([\s\S]*?)```/.exec(trimmed);
  if (codeBlock?.[1]) return codeBlock[1].trim();
  return trimmed;
}

/**
 * Creates the design_schema_pro tool for structured 5-phase data modeling.
 */
export function createDesignSchemaProTool(model: Model) {
  return defineTool({
    name: 'design_schema_pro',
    description:
      'Generate an enterprise-quality database schema using 5-phase analysis (Entity Discovery, Relationship Mapping, Permission Derivation, Schema Generation, Validation). Use when structured context is available.',
    input: z.object({
      projectName: z.string().describe('Project name'),
      projectGoal: z.string().describe('Project goal / purpose'),
      databaseType: z.enum(['mongodb', 'postgresql']).describe('Target database type'),
      context: z.string().describe('Full project context: features, actors, flows, stories'),
    }),
    handler: async ({
      projectName,
      projectGoal,
      databaseType,
      context,
    }): Promise<TDataModelDesign> => {
      const userPrompt = buildProDesignPrompt(projectName, projectGoal, databaseType, context);
      const messages = [
        {
          role: 'system' as const,
          content: 'You are a database schema expert. Return only valid JSON.',
        },
        { role: 'user' as const, content: userPrompt },
      ];
      const response = await model.invoke(messages, { temperature: 0.2, maxOutputTokens: 16384 });
      const jsonStr = extractJson(response.text);
      const parsed = JSON.parse(jsonStr) as unknown;
      return dataModelDesignSchema.parse(parsed);
    },
  });
}
