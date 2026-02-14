/**
 * Design stage - direct LLM calls for database and API design (prompt chaining)
 */

import type { Model } from '../../../lib/types/model';
import type { RequirementContext, StageResult } from '../types';
import { databaseDesignSchema, apiDesignSchema } from '../schemas';
import { extractJson, summarizeModules, summarizeStories } from './base';
import {
  DESIGN_DATABASE_SYSTEM_PROMPT,
  DESIGN_APIS_SYSTEM_PROMPT,
  buildDesignDatabasePrompt,
  buildDesignApisPrompt,
} from '../prompts';

export async function runDesignStage(
  _userMessage: string,
  context: RequirementContext,
  model: Model
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

  const projectBriefStr = JSON.stringify(brief);
  const modulesSummary = summarizeModules(context.modules);
  const storiesSummary = summarizeStories(context.stories);
  const actorsSummary = context.actors.map(a => `${a.name}: ${a.description}`).join('\n');

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
  const databaseResult = databaseDesignSchema.safeParse(JSON.parse(dbJsonStr) as unknown);
  if (!databaseResult.success) {
    return {
      message: 'Failed to produce database design. Please try again.',
      advance: false,
      data: {},
    };
  }
  const database = databaseResult.data;

  const apiPrompt = buildDesignApisPrompt(
    projectBriefStr,
    modulesSummary,
    actorsSummary,
    storiesSummary,
    JSON.stringify(database)
  );
  const apiMessages = [
    { role: 'system' as const, content: DESIGN_APIS_SYSTEM_PROMPT },
    { role: 'user' as const, content: apiPrompt },
  ];
  const apiResponse = await model.invoke(apiMessages, {
    temperature: 0.3,
    maxOutputTokens: 16384,
  });
  const apiJsonStr = extractJson(apiResponse.text);
  const apiDesignResult = apiDesignSchema.safeParse(JSON.parse(apiJsonStr) as unknown);
  if (!apiDesignResult.success) {
    return {
      message: 'Failed to produce API design. Please try again.',
      advance: false,
      data: { database },
    };
  }
  const apiDesign = apiDesignResult.data;

  return {
    message: `Database: ${database.type}. API: ${apiDesign.style}.`,
    advance: true,
    data: { database, apiDesign, pendingQuestions: [] },
  };
}
