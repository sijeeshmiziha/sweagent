/**
 * Requirements stage - delegates to specialist agents:
 * data-modeler (data models), auth-designer (auth flow), frontend-architect (pages/routes)
 * Overview, tech stack, and feature decisions use direct LLM calls for markdown output.
 */

import type { Logger } from '../../../lib/types/common';
import type { Model } from '../../../lib/types/model';
import type { PlanningContext, PlanStageResult } from '../types';
import { PLANNING_SYSTEM_PROMPT } from '../prompts';
import { buildRequirementsOverviewPrompt, buildRequirementsFeatureDataPrompt } from '../prompts';
import { runSubagent } from '../../../lib/subagents';
import { entityAnalyzerSubagent } from '../../data-modeler/subagents';
import { pagePlannerSubagent } from '../../frontend-architect/subagents';
import { flowDesignerSubagent } from '../../auth-designer/subagents';

function invokeMarkdown(model: Model, systemPrompt: string, userPrompt: string): Promise<string> {
  const messages = [
    { role: 'system' as const, content: systemPrompt },
    { role: 'user' as const, content: userPrompt },
  ];
  return model
    .invoke(messages, { temperature: 0.3, maxOutputTokens: 8192 })
    .then(r => r.text?.trim() ?? '');
}

function splitOverviewAndTechStack(text: string): { overview: string; techStack: string } {
  const idx = text.indexOf('## Tech Stack');
  if (idx < 0) return { overview: text, techStack: '' };
  return { overview: text.slice(0, idx).trim(), techStack: text.slice(idx).trim() };
}

function splitFeatureDecisionsAndDataModels(text: string): {
  featureDecisions: string;
  dataModels: string;
} {
  const idx = text.indexOf('## Data Models');
  if (idx < 0) return { featureDecisions: text, dataModels: '' };
  return { featureDecisions: text.slice(0, idx).trim(), dataModels: text.slice(idx).trim() };
}

export async function runRequirementsStage(
  _userMessage: string,
  context: PlanningContext,
  model: Model,
  logger?: Logger
): Promise<PlanStageResult> {
  logger?.debug('Requirements stage started (specialist agents)');

  const ctx = context.projectDescription ?? '';
  if (!ctx) {
    return {
      message: 'No project description yet. Complete discovery first.',
      advance: false,
      sections: {},
    };
  }

  const systemPrompt = `${PLANNING_SYSTEM_PROMPT}\n\nOutput only markdown. Do NOT output JSON.`;

  // Part 1: Overview + Tech Stack (direct LLM call)
  const part1 = await invokeMarkdown(model, systemPrompt, buildRequirementsOverviewPrompt(ctx));
  const { overview, techStack } = splitOverviewAndTechStack(part1);

  // Part 2: Feature Decisions + Data Models via entity-analyzer specialist
  const part2 = await invokeMarkdown(
    model,
    systemPrompt,
    buildRequirementsFeatureDataPrompt(ctx, part1)
  );
  const { featureDecisions } = splitFeatureDecisionsAndDataModels(part2);

  logger?.info('Delegating to data-modeler specialist');
  const dataModelResult = await runSubagent(
    entityAnalyzerSubagent,
    `Analyze the data model for this project:\n\n${ctx}\n\nFeatures:\n${featureDecisions}`,
    { parentModel: model }
  );
  const dataModels = dataModelResult.output;

  // Part 3: Pages and Routes via frontend-architect specialist
  logger?.info('Delegating to frontend-architect specialist');
  const priorContext = [part1, featureDecisions, dataModels].join('\n\n---\n\n');
  const pagesResult = await runSubagent(
    pagePlannerSubagent,
    `Design the pages and routes for this project:\n\n${ctx}\n\nContext:\n${priorContext}`,
    { parentModel: model }
  );
  const pagesAndRoutes = pagesResult.output;

  // Part 4: Auth Flow via auth-designer specialist
  logger?.info('Delegating to auth-designer specialist');
  const fullContext = [priorContext, pagesAndRoutes].join('\n\n---\n\n');
  const authResult = await runSubagent(
    flowDesignerSubagent,
    `Design the authentication flows for this project:\n\n${ctx}\n\nContext:\n${fullContext}`,
    { parentModel: model }
  );
  const authFlow = authResult.output;

  logger?.info('Requirements stage complete (specialist agents)');
  return {
    message:
      'Requirements generated via specialist agents (Data Modeler, Frontend Architect, Auth Designer).',
    advance: true,
    sections: { overview, techStack, featureDecisions, dataModels, pagesAndRoutes, authFlow },
  };
}
