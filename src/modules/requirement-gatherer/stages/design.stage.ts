/**
 * Design stage - direct LLM call for database design (prompt chaining)
 * Note: API design removed; delegated to the api-designer module downstream.
 */

import { z } from 'zod';
import type { Logger } from '../../../lib/types/common';
import type { Model } from '../../../lib/types/model';
import type { RequirementContext, StageResult } from '../types';
import { databaseDesignSchema } from '../schemas';
import { extractJson, safeParseJson, summarizeModules, summarizeStories } from './base';
import { DESIGN_DATABASE_SYSTEM_PROMPT, buildDesignDatabasePrompt } from '../prompts';

export async function runDesignStage(
  _userMessage: string,
  context: RequirementContext,
  model: Model,
  logger?: Logger
): Promise<StageResult> {
  const brief = context.projectBrief;
  if (!brief) {
    return { message: 'Project brief is missing.', advance: false, data: {} };
  }
  if (!context.modules.length || !context.stories.length) {
    return {
      message: 'Requirements (modules and stories) are missing. Run requirements stage first.',
      advance: false,
      data: {},
    };
  }

  logger?.info('Design stage: database design', {
    modules: context.modules.length,
    stories: context.stories.length,
  });

  const projectBriefStr = JSON.stringify(brief);
  const modulesSummary = summarizeModules(context.modules);
  const storiesSummary = summarizeStories(context.stories);

  const dbPrompt = buildDesignDatabasePrompt(projectBriefStr, modulesSummary, storiesSummary);
  const dbMessages = [
    { role: 'system' as const, content: DESIGN_DATABASE_SYSTEM_PROMPT },
    { role: 'user' as const, content: dbPrompt },
  ];
  const dbResponse = await model.invoke(dbMessages, {
    temperature: 0.3,
    maxOutputTokens: 8192,
  });
  const dbJsonStr = extractJson(dbResponse.text);
  const dbParsed = safeParseJson(dbJsonStr);
  if (!dbParsed.success) {
    logger?.warn('Database design response was not valid JSON', { error: dbParsed.error });
    return {
      message: 'Failed to parse database design response. Please try again.',
      advance: false,
      data: {},
    };
  }
  const databaseResult = databaseDesignSchema.safeParse(dbParsed.data);
  if (!databaseResult.success) {
    const err = databaseResult.error;
    logger?.warn('Database design schema validation failed', { error: z.treeifyError(err) });
    return {
      message: 'Failed to produce database design. Please try again.',
      advance: false,
      data: {},
    };
  }
  const database = databaseResult.data;

  return {
    message: `Database design complete: ${database.type}. API design will be handled by the api-designer module.`,
    advance: true,
    data: { database, pendingQuestions: [] },
  };
}
