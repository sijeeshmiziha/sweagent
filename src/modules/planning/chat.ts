/**
 * processPlanningChat - main entry point for chat-based planning
 */

import { createModel } from '../../lib/models/create-model';
import type { PlanningContext, PlanChatTurnResult, PlanningChatConfig, Stage } from './types';
import { createInitialContext, addChatEntry, advanceStage } from './context';
import { runStage } from './router';

const STAGE_ORDER: Stage[] = ['discovery', 'requirements', 'design', 'complete'];

export async function processPlanningChat(
  userMessage: string,
  context: PlanningContext | null,
  config: PlanningChatConfig
): Promise<PlanChatTurnResult> {
  const { logger } = config;

  const modelConfig = config.model ?? { provider: 'openai', model: 'gpt-4o-mini' };
  const model = createModel(modelConfig);

  let ctx: PlanningContext = context ?? createInitialContext();
  ctx = addChatEntry(ctx, 'user', userMessage);

  logger?.info('Planning chat turn', { stage: ctx.stage, messageLength: userMessage.length });

  let message = '';
  let pendingQuestions: string[] = [];
  let planMarkdown: string | null = null;

  const runOne = async (stage: Stage): Promise<{ advance: boolean; planMarkdown?: string }> => {
    const result = await runStage(stage, userMessage, ctx, model, logger);
    message = result.message;
    pendingQuestions = result.pendingQuestions;
    ctx = result.data;
    if (result.planMarkdown) planMarkdown = result.planMarkdown;
    return { advance: result.advance, planMarkdown: result.planMarkdown };
  };

  let stage = ctx.stage;
  logger?.info('Stage', { stage });
  let runResult = await runOne(stage);

  while (runResult.advance && !planMarkdown) {
    const idx = STAGE_ORDER.indexOf(stage);
    const nextStage = idx >= 0 && idx < STAGE_ORDER.length - 1 ? STAGE_ORDER[idx + 1] : undefined;
    if (nextStage === undefined) break;
    logger?.info('Stage transition', { from: stage, to: nextStage });
    stage = nextStage;
    ctx = advanceStage(ctx);
    ctx = { ...ctx, stage };
    logger?.info('Stage', { stage });
    runResult = await runOne(stage);
  }

  ctx = addChatEntry(ctx, 'assistant', message);

  logger?.info('Planning chat turn done', { stage, hasPlanMarkdown: !!planMarkdown });
  return {
    message,
    context: ctx,
    pendingQuestions,
    planMarkdown,
  };
}
