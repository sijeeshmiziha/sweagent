/**
 * Context management for requirement chat
 */

import type { RequirementContext, StageResult, Stage, ChatEntry } from './types';

export function createInitialContext(): RequirementContext {
  return {
    stage: 'discovery',
    projectBrief: null,
    actors: [],
    flows: [],
    stories: [],
    modules: [],
    database: null,
    history: [],
    pendingQuestions: [],
  };
}

export function mergeStageResult(
  context: RequirementContext,
  result: StageResult
): RequirementContext {
  const data = result.data;
  return {
    ...context,
    ...(data.stage !== undefined && { stage: data.stage }),
    ...(data.projectBrief !== undefined && { projectBrief: data.projectBrief }),
    ...(data.actors !== undefined && { actors: data.actors }),
    ...(data.flows !== undefined && { flows: data.flows }),
    ...(data.stories !== undefined && { stories: data.stories }),
    ...(data.modules !== undefined && { modules: data.modules }),
    ...(data.database !== undefined && { database: data.database }),
    ...(data.pendingQuestions !== undefined && { pendingQuestions: data.pendingQuestions }),
  };
}

export function addChatEntry(
  context: RequirementContext,
  role: 'user' | 'assistant',
  content: string
): RequirementContext {
  const entry: ChatEntry = { role, content };
  return {
    ...context,
    history: [...context.history, entry],
  };
}

export function advanceStage(context: RequirementContext): RequirementContext {
  const order: Stage[] = ['discovery', 'requirements', 'design', 'complete'];
  const idx = order.indexOf(context.stage);
  const nextStage = idx >= 0 && idx < order.length - 1 ? order[idx + 1] : undefined;
  const next: Stage = nextStage ?? context.stage;
  return { ...context, stage: next };
}
