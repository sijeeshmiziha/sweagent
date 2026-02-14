/**
 * processRequirementChat - main entry point for chat-based requirement gathering
 */

import { createModel } from '../../lib/models/create-model';
import type { RequirementContext, ChatTurnResult, RequirementChatConfig, Stage } from './types';
import { createInitialContext, addChatEntry, advanceStage } from './context';
import { runStage } from './router';

const STAGE_ORDER: Stage[] = ['discovery', 'requirements', 'design', 'complete'];

export async function processRequirementChat(
  userMessage: string,
  context: RequirementContext | null,
  config: RequirementChatConfig
): Promise<ChatTurnResult> {
  const { logger } = config;
  logger?.info('Processing chat turn', { messageLength: userMessage.length });

  const modelConfig = config.model ?? { provider: 'openai', model: 'gpt-4o-mini' };
  const model = createModel(modelConfig);

  let ctx: RequirementContext = context ?? createInitialContext();
  ctx = addChatEntry(ctx, 'user', userMessage);

  let message = '';
  let questions: RequirementContext['pendingQuestions'] = [];
  let finalRequirement: ChatTurnResult['finalRequirement'] = null;

  const runOne = async (
    stage: Stage
  ): Promise<{ advance: boolean; finalReq?: ChatTurnResult['finalRequirement'] }> => {
    const result = await runStage(stage, userMessage, ctx, model, logger);
    message = result.message;
    questions = result.questions;
    ctx = result.data;
    if (result.finalRequirement) finalRequirement = result.finalRequirement;
    return { advance: result.advance, finalReq: result.finalRequirement };
  };

  let stage = ctx.stage;
  logger?.info('Running stage', { stage });
  let runResult = await runOne(stage);
  ctx = { ...ctx, pendingQuestions: questions };

  while (runResult.advance && !finalRequirement) {
    const idx = STAGE_ORDER.indexOf(stage);
    const nextStage = idx >= 0 && idx < STAGE_ORDER.length - 1 ? STAGE_ORDER[idx + 1] : undefined;
    if (nextStage === undefined) break;
    logger?.info('Stage transition', { from: stage, to: nextStage });
    stage = nextStage;
    ctx = advanceStage(ctx);
    ctx = { ...ctx, stage };
    logger?.info('Running stage', { stage });
    runResult = await runOne(stage);
    ctx = { ...ctx, pendingQuestions: questions };
  }

  ctx = addChatEntry(ctx, 'assistant', message);

  logger?.debug('Chat turn complete', { stage, hasFinalRequirement: !!finalRequirement });
  return {
    message,
    context: ctx,
    questions,
    finalRequirement,
  };
}
