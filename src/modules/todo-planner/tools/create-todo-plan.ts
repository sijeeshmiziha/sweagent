/**
 * create_todo_plan tool - generates a structured TodoPlan from a problem description (uses AI)
 */

import { z } from 'zod';
import type { Model } from '../../../lib/types/model';
import { defineTool } from '../../../lib/tools';
import { todoPlanSchema, type TTodoPlan } from '../schemas';
import { buildTodoPlanPrompt } from '../prompts';
import { parseModelJsonResponse } from '../../../lib/utils';

/**
 * Creates the create_todo_plan tool. Requires a model for plan generation.
 */
export function createTodoPlanTool(model: Model) {
  return defineTool({
    name: 'create_todo_plan',
    description:
      'Generate a dependency-aware todo plan from a problem description. Produces structured JSON with tasks, dependencies, execution order, effort estimates, and risks.',
    input: z.object({
      problem: z.string().describe('Problem or task description to decompose into a todo plan'),
      context: z
        .string()
        .optional()
        .describe(
          'Optional additional context: sub-problem analysis, dependency analysis, constraints'
        ),
    }),
    handler: async ({ problem, context }): Promise<TTodoPlan> => {
      const fullProblem = context ? `${problem}\n\n## Additional Context\n${context}` : problem;
      const userPrompt = buildTodoPlanPrompt(fullProblem);
      const messages = [
        {
          role: 'system' as const,
          content:
            'You are a software architect. Return only valid JSON matching the TodoPlan schema.',
        },
        { role: 'user' as const, content: userPrompt },
      ];
      const response = await model.invoke(messages, { temperature: 0.3, maxOutputTokens: 16384 });
      return parseModelJsonResponse(response.text, todoPlanSchema);
    },
  });
}
