/**
 * Requirements stage - chain actors -> flows -> stories -> modules
 */

import type { Logger } from '../../../lib/types/common';
import type { Model } from '../../../lib/types/model';
import type { ModelMessage } from '../../../lib/types/common';
import type { RequirementContext, StageResult } from '../types';
import {
  actorsResultSchema,
  flowsResultSchema,
  storiesResultSchema,
  modulesResultSchema,
} from '../schemas';
import { REQUIREMENT_GATHERER_SYSTEM_PROMPT } from '../prompts';
import {
  buildExtractActorsPrompt,
  buildGenerateFlowsPrompt,
  buildGenerateStoriesPrompt,
  buildExtractModulesPrompt,
} from '../prompts';
import { extractJson, safeParseJson } from './base';

export async function runRequirementsStage(
  _userMessage: string,
  context: RequirementContext,
  model: Model,
  logger?: Logger
): Promise<StageResult> {
  logger?.debug('Requirements stage started');

  const brief = context.projectBrief;
  if (!brief) {
    return {
      message: 'Project brief is missing. Complete discovery first.',
      advance: false,
      data: {},
    };
  }
  const projectName = brief.name;
  const projectGoal = brief.goal;
  const projectFeatures = brief.features.join('. ');

  const messages: ModelMessage[] = [
    { role: 'system', content: REQUIREMENT_GATHERER_SYSTEM_PROMPT },
  ];

  const actorsPrompt = buildExtractActorsPrompt(projectName, projectGoal, projectFeatures);
  messages.push({ role: 'user', content: actorsPrompt });
  let response = await model.invoke(messages, { temperature: 0.4, maxOutputTokens: 4096 });
  const actorsJson = extractJson(response.text);
  const actorsParsed = safeParseJson(actorsJson);
  if (!actorsParsed.success) {
    logger?.warn('Requirements: actors response was not valid JSON', { error: actorsParsed.error });
    return {
      message: 'Failed to parse actors response. Please try again.',
      advance: false,
      data: {},
    };
  }
  const actorsResult = actorsResultSchema.safeParse(actorsParsed.data);
  if (!actorsResult.success) {
    logger?.warn('Requirements: actors schema validation failed', {
      error: actorsResult.error.message,
    });
    return {
      message: 'Failed to extract actors. Please try again.',
      advance: false,
      data: {},
    };
  }
  const actors = actorsResult.data.actors;
  logger?.debug('Requirements: actors extracted', { count: actors.length });

  const flowsPrompt = buildGenerateFlowsPrompt(
    projectName,
    projectGoal,
    projectFeatures,
    JSON.stringify(actors)
  );
  messages.push({
    role: 'assistant',
    content: `[Extracted ${actors.length} actors]`,
  });
  messages.push({ role: 'user', content: flowsPrompt });
  response = await model.invoke(messages, { temperature: 0.4, maxOutputTokens: 8192 });
  const flowsJson = extractJson(response.text);
  const flowsParsed = safeParseJson(flowsJson);
  if (!flowsParsed.success) {
    logger?.warn('Requirements: flows response was not valid JSON', { error: flowsParsed.error });
    return {
      message: 'Failed to parse flows response. Please try again.',
      advance: false,
      data: { actors },
    };
  }
  const flowsResult = flowsResultSchema.safeParse(flowsParsed.data);
  if (!flowsResult.success) {
    logger?.warn('Requirements: flows schema validation failed', {
      error: flowsResult.error.message,
    });
    return {
      message: 'Failed to generate flows. Please try again.',
      advance: false,
      data: { actors },
    };
  }
  const flows = flowsResult.data.flows;
  logger?.debug('Requirements: flows generated', { count: flows.length });

  const storiesPrompt = buildGenerateStoriesPrompt(
    projectName,
    projectGoal,
    projectFeatures,
    JSON.stringify(actors),
    JSON.stringify(flows)
  );
  messages.push({
    role: 'assistant',
    content: `[Generated ${flows.length} flows]`,
  });
  messages.push({ role: 'user', content: storiesPrompt });
  response = await model.invoke(messages, { temperature: 0.4, maxOutputTokens: 16384 });
  const storiesJson = extractJson(response.text);
  const storiesParsed = safeParseJson(storiesJson);
  if (!storiesParsed.success) {
    logger?.warn('Requirements: stories response was not valid JSON', {
      error: storiesParsed.error,
    });
    return {
      message: 'Failed to parse stories response. Please try again.',
      advance: false,
      data: { actors, flows },
    };
  }
  const storiesResult = storiesResultSchema.safeParse(storiesParsed.data);
  if (!storiesResult.success) {
    logger?.warn('Requirements: stories schema validation failed', {
      error: storiesResult.error.message,
    });
    return {
      message: 'Failed to generate stories. Please try again.',
      advance: false,
      data: { actors, flows },
    };
  }
  const stories = storiesResult.data.stories;
  logger?.debug('Requirements: stories generated', { count: stories.length });

  const modulesPrompt = buildExtractModulesPrompt(
    projectName,
    projectGoal,
    projectFeatures,
    JSON.stringify(actors),
    JSON.stringify(flows),
    JSON.stringify(stories)
  );
  messages.push({
    role: 'assistant',
    content: `[Generated ${stories.length} stories]`,
  });
  messages.push({ role: 'user', content: modulesPrompt });
  response = await model.invoke(messages, { temperature: 0.4, maxOutputTokens: 16384 });
  const modulesJson = extractJson(response.text);
  const modulesParsed = safeParseJson(modulesJson);
  if (!modulesParsed.success) {
    logger?.warn('Requirements: modules response was not valid JSON', {
      error: modulesParsed.error,
    });
    return {
      message: 'Failed to parse modules response. Please try again.',
      advance: false,
      data: { actors, flows, stories },
    };
  }
  const modulesResult = modulesResultSchema.safeParse(modulesParsed.data);
  if (!modulesResult.success) {
    logger?.warn('Requirements: modules schema validation failed', {
      error: modulesResult.error.message,
    });
    return {
      message: 'Failed to extract modules. Please try again.',
      advance: false,
      data: { actors, flows, stories },
    };
  }
  const modules = modulesResult.data.modules;
  logger?.debug('Requirements stage complete', {
    actors: actors.length,
    flows: flows.length,
    stories: stories.length,
    modules: modules.length,
  });

  return {
    message: `I've identified ${actors.length} actors, ${flows.length} flows, ${stories.length} stories, and ${modules.length} modules. Proceeding to technical design.`,
    advance: true,
    data: { actors, flows, stories, modules, pendingQuestions: [] },
  };
}
