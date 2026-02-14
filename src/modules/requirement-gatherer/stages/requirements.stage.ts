/**
 * Requirements stage - chain actors -> flows -> stories -> modules
 */

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
import { extractJson } from './base';

export async function runRequirementsStage(
  _userMessage: string,
  context: RequirementContext,
  model: Model
): Promise<StageResult> {
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
  const actorsResult = actorsResultSchema.safeParse(JSON.parse(actorsJson) as unknown);
  if (!actorsResult.success) {
    return {
      message: 'Failed to extract actors. Please try again.',
      advance: false,
      data: {},
    };
  }
  const actors = actorsResult.data.actors;

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
  const flowsResult = flowsResultSchema.safeParse(JSON.parse(flowsJson) as unknown);
  if (!flowsResult.success) {
    return {
      message: 'Failed to generate flows. Please try again.',
      advance: false,
      data: { actors },
    };
  }
  const flows = flowsResult.data.flows;

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
  const storiesResult = storiesResultSchema.safeParse(JSON.parse(storiesJson) as unknown);
  if (!storiesResult.success) {
    return {
      message: 'Failed to generate stories. Please try again.',
      advance: false,
      data: { actors, flows },
    };
  }
  const stories = storiesResult.data.stories;

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
  const modulesResult = modulesResultSchema.safeParse(JSON.parse(modulesJson) as unknown);
  if (!modulesResult.success) {
    return {
      message: 'Failed to extract modules. Please try again.',
      advance: false,
      data: { actors, flows, stories },
    };
  }
  const modules = modulesResult.data.modules;

  return {
    message: `I've identified ${actors.length} actors, ${flows.length} flows, ${stories.length} stories, and ${modules.length} modules. Proceeding to technical design.`,
    advance: true,
    data: { actors, flows, stories, modules, pendingQuestions: [] },
  };
}
