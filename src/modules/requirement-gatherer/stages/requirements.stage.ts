/**
 * Requirements stage - chain actors -> flows -> stories -> modules
 * Uses AI SDK structured output (invokeObject); no fallback data.
 */

import type { Logger } from '../../../lib/types/common';
import type { Model } from '../../../lib/types/model';
import type { ModelMessage } from '../../../lib/types/common';
import type { RequirementContext, StageResult } from '../types';
import { REQUIREMENT_GATHERER_SYSTEM_PROMPT } from '../prompts';
import {
  buildExtractActorsPrompt,
  buildGenerateFlowsPrompt,
  buildGenerateStoriesPrompt,
  buildExtractModulesPrompt,
} from '../prompts';
import { getActors, getFlows, getStories, getModules } from './requirements-invoke';

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

  try {
    messages.push({
      role: 'user',
      content: buildExtractActorsPrompt(projectName, projectGoal, projectFeatures),
    });
    const actorsResult = await getActors(model, messages, logger);
    const actors = actorsResult.actors;
    logger?.debug('Requirements: actors', { count: actors.length });

    messages.push({
      role: 'assistant',
      content: `[Extracted ${actors.length} actors]`,
    });
    messages.push({
      role: 'user',
      content: buildGenerateFlowsPrompt(
        projectName,
        projectGoal,
        projectFeatures,
        JSON.stringify(actors)
      ),
    });
    const flowsResult = await getFlows(model, messages, actors, logger);
    const flows = flowsResult.flows;
    logger?.debug('Requirements: flows', { count: flows.length });

    messages.push({
      role: 'assistant',
      content: `[Generated ${flows.length} flows]`,
    });
    messages.push({
      role: 'user',
      content: buildGenerateStoriesPrompt(
        projectName,
        projectGoal,
        projectFeatures,
        JSON.stringify(actors),
        JSON.stringify(flows)
      ),
    });
    const storiesResult = await getStories(model, messages, actors, flows, logger);
    const stories = storiesResult.stories;
    logger?.debug('Requirements: stories', { count: stories.length });

    messages.push({
      role: 'assistant',
      content: `[Generated ${stories.length} stories]`,
    });
    messages.push({
      role: 'user',
      content: buildExtractModulesPrompt(
        projectName,
        projectGoal,
        projectFeatures,
        JSON.stringify(actors),
        JSON.stringify(flows),
        JSON.stringify(stories)
      ),
    });
    const modulesResult = await getModules(model, messages, actors, flows, stories, logger);
    const modules = modulesResult.modules;
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
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger?.warn('Requirements stage failed', { error: message });
    return {
      message: `Requirements step failed: ${message}. Please try again.`,
      advance: false,
      data: {},
    };
  }
}
