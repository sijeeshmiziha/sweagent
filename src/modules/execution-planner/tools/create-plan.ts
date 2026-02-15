/**
 * create_execution_plan tool - generates execution plan from context (uses AI)
 */

import { z } from 'zod';
import type { Model } from '../../../lib/types/model';
import { defineTool } from '../../../lib/tools';
import { executionPlanSchema, type TExecutionPlan } from '../schemas';
import { buildCreateExecutionPlanPrompt } from '../prompts';

function extractJson(text: string): string {
  const trimmed = text.trim();
  const codeBlock = /```(?:json)?\s*([\s\S]*?)```/.exec(trimmed);
  if (codeBlock?.[1]) return codeBlock[1].trim();
  return trimmed;
}

/**
 * Creates the create_execution_plan tool for generating phased plans.
 */
export function createExecutionPlanTool(model: Model) {
  return defineTool({
    name: 'create_execution_plan',
    description:
      'Generate a comprehensive execution plan with phases, edge cases, and testing checklist from the full plan context.',
    input: z.object({
      context: z.string().describe('Full plan context: all sections generated so far'),
    }),
    handler: async ({ context }): Promise<TExecutionPlan> => {
      const userPrompt = buildCreateExecutionPlanPrompt(context);
      const messages = [
        {
          role: 'system' as const,
          content: 'You are a tech lead. Return only valid JSON.',
        },
        { role: 'user' as const, content: userPrompt },
      ];
      const response = await model.invoke(messages, { temperature: 0.3, maxOutputTokens: 16384 });
      const jsonStr = extractJson(response.text);
      const parsed = JSON.parse(jsonStr) as unknown;
      return executionPlanSchema.parse(parsed);
    },
  });
}
