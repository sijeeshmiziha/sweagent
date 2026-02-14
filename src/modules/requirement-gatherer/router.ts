/**
 * Stage routing and auto-advance logic (State pattern)
 */

import type { Logger } from '../../lib/types/common';
import type { Model } from '../../lib/types/model';
import type { RequirementContext, Stage, FinalRequirement } from './types';
import { getStateForStage } from './stages';
import { isConfirmation } from './stages/base';
import { advanceStage, mergeStageResult, addChatEntry } from './context';

/**
 * Determine which stage to run for this turn.
 */
export function getStageForTurn(context: RequirementContext, _userMessage: string): Stage {
  return context.stage;
}

/**
 * Run the current stage via State pattern: get state for context.stage, process, merge result.
 * If result.advance, context.stage is advanced to the next state's stage name.
 */
export async function runStage(
  stage: Stage,
  userMessage: string,
  context: RequirementContext,
  model: Model,
  logger?: Logger
): Promise<{
  message: string;
  questions: RequirementContext['pendingQuestions'];
  advance: boolean;
  data: RequirementContext;
  finalRequirement?: FinalRequirement;
}> {
  logger?.debug('Stage processor invoked', { stage });
  const state = getStateForStage(stage);
  const result = await state.process(context, { userMessage, model });
  const merged = mergeStageResult(context, result);
  const finalReq = 'finalRequirement' in result.data ? result.data.finalRequirement : undefined;
  logger?.debug('Stage result', {
    stage,
    advance: result.advance,
    hasFinalRequirement: !!finalReq,
  });
  const data: RequirementContext = {
    ...merged,
    pendingQuestions: result.questions ?? merged.pendingQuestions,
  };
  return {
    message: result.message,
    questions: result.questions ?? merged.pendingQuestions,
    advance: result.advance,
    data,
    finalRequirement: finalReq,
  };
}

/**
 * Whether the user message is a confirmation (continue / yes / looks good)
 */
export { isConfirmation };

/**
 * Advance context to next stage
 */
export { advanceStage };

/**
 * Add a chat entry to context history
 */
export { addChatEntry };
