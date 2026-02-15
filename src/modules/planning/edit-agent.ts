/**
 * editPlan - single LLM call to revise an existing plan based on feedback.
 * Takes existing plan markdown + edit instructions, returns updated markdown.
 */

import type { EditPlanConfig } from './types';
import { createModel } from '../../lib/models/create-model';
import { EDIT_PLAN_SYSTEM_PROMPT, buildEditPlanPrompt } from './prompts';

/**
 * Edit an existing plan based on feedback or additional context.
 * Single focused LLM call -- no multi-stage pipeline needed.
 * Returns the full revised plan as a markdown string.
 */
export async function editPlan(config: EditPlanConfig): Promise<string> {
  const { existingPlan, feedback, logger } = config;
  logger?.info('Editing plan', { feedbackLength: feedback.length });

  if (!existingPlan || existingPlan.trim().length < 50) {
    throw new Error('existingPlan is too short or empty. Provide a valid plan to edit.');
  }
  if (!feedback || feedback.trim().length === 0) {
    throw new Error('feedback is empty. Provide edit instructions.');
  }

  const modelConfig = config.model ?? { provider: 'openai' as const, model: 'gpt-4o-mini' };
  const model = createModel(modelConfig);

  const response = await model.invoke(
    [
      { role: 'system' as const, content: EDIT_PLAN_SYSTEM_PROMPT },
      { role: 'user' as const, content: buildEditPlanPrompt(existingPlan, feedback) },
    ],
    { temperature: 0.3, maxOutputTokens: 16384 }
  );

  const revised = response.text?.trim() ?? '';
  if (!revised) {
    throw new Error('Model returned empty response when editing plan.');
  }

  logger?.info('Plan edited successfully', { outputLength: revised.length });
  return revised;
}
