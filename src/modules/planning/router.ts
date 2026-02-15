/**
 * Stage routing and auto-advance logic (State pattern)
 */

import type { Logger } from '../../lib/types/common';
import type { Model } from '../../lib/types/model';
import type { PlanningContext, Stage } from './types';
import { getStateForStage } from './stages';
import { isConfirmation } from './stages/base';
import { advanceStage, mergeStageResult, addChatEntry } from './context';

export function getStageForTurn(context: PlanningContext, _userMessage: string): Stage {
  return context.stage;
}

/**
 * Run the current stage via State pattern; merge result into context.
 * Returns planMarkdown when synthesis stage completes.
 */
export async function runStage(
  stage: Stage,
  userMessage: string,
  context: PlanningContext,
  model: Model,
  logger?: Logger
): Promise<{
  message: string;
  pendingQuestions: string[];
  advance: boolean;
  data: PlanningContext;
  planMarkdown?: string;
}> {
  logger?.debug('Stage processor invoked', { stage });
  const state = getStateForStage(stage);
  const result = await state.process(context, { userMessage, model, logger });
  const merged = mergeStageResult(context, result);
  const data: PlanningContext = {
    ...merged,
    pendingQuestions: result.pendingQuestions ?? merged.pendingQuestions,
  };
  logger?.debug('Stage result', {
    stage,
    advance: result.advance,
    hasPlanMarkdown: !!result.planMarkdown,
  });
  return {
    message: result.message,
    pendingQuestions: result.pendingQuestions ?? merged.pendingQuestions,
    advance: result.advance,
    data,
    planMarkdown: result.planMarkdown,
  };
}

export { isConfirmation, advanceStage, addChatEntry };
