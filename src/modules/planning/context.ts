/**
 * Context management for planning chat
 */

import type { PlanningContext, PlanStageResult, PlanSections, Stage, ChatEntry } from './types';

const EMPTY_SECTIONS: PlanSections = {
  overview: null,
  techStack: null,
  featureDecisions: null,
  dataModels: null,
  pagesAndRoutes: null,
  authFlow: null,
  apiRoutes: null,
  implementation: null,
  executionPlan: null,
  edgeCases: null,
  testingChecklist: null,
};

export function createInitialContext(): PlanningContext {
  return {
    stage: 'discovery',
    projectDescription: null,
    sections: { ...EMPTY_SECTIONS },
    history: [],
    pendingQuestions: [],
  };
}

export function mergeStageResult(
  context: PlanningContext,
  result: PlanStageResult
): PlanningContext {
  const { sections: newSections, projectDescription, pendingQuestions } = result;
  const sections: PlanSections = { ...context.sections };
  if (newSections) {
    for (const key of Object.keys(newSections) as (keyof PlanSections)[]) {
      const v = newSections[key];
      if (v !== undefined && v !== null) sections[key] = v;
    }
  }
  return {
    ...context,
    ...(projectDescription !== undefined && { projectDescription }),
    sections,
    ...(pendingQuestions !== undefined && { pendingQuestions }),
  };
}

export function addChatEntry(
  context: PlanningContext,
  role: 'user' | 'assistant',
  content: string
): PlanningContext {
  const entry: ChatEntry = { role, content };
  return {
    ...context,
    history: [...context.history, entry],
  };
}

export function advanceStage(context: PlanningContext): PlanningContext {
  const order: Stage[] = ['discovery', 'requirements', 'design', 'complete'];
  const idx = order.indexOf(context.stage);
  const nextStage = idx >= 0 && idx < order.length - 1 ? order[idx + 1] : undefined;
  const next: Stage = nextStage ?? context.stage;
  return { ...context, stage: next };
}
