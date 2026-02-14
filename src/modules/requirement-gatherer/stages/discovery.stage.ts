/**
 * Discovery stage - understand project, optional clarifying questions
 */

import type { Logger } from '../../../lib/types/common';
import type { Model } from '../../../lib/types/model';
import type { RequirementContext, StageResult } from '../types';
import { projectBriefSchema, questionSchema } from '../schemas';
import { REQUIREMENT_GATHERER_SYSTEM_PROMPT } from '../prompts';
import { DISCOVERY_SYSTEM_FRAGMENT, buildDiscoveryPrompt } from '../prompts';
import { extractJson, safeParseJson } from './base';

export async function runDiscoveryStage(
  userMessage: string,
  context: RequirementContext,
  model: Model,
  logger?: Logger
): Promise<StageResult> {
  logger?.debug('Discovery stage started', { historyLength: context.history.length });

  const history = context.history
    .map(e => `${e.role}: ${e.content}`)
    .slice(-10)
    .join('\n');
  const prompt = buildDiscoveryPrompt(userMessage, history);
  const systemContent = `${REQUIREMENT_GATHERER_SYSTEM_PROMPT}\n\n${DISCOVERY_SYSTEM_FRAGMENT}`;
  const messages = [
    { role: 'system' as const, content: systemContent },
    { role: 'user' as const, content: prompt },
  ];
  const response = await model.invoke(messages, { temperature: 0.4, maxOutputTokens: 4096 });
  const jsonStr = extractJson(response.text);
  const parsed = safeParseJson(jsonStr);
  if (!parsed.success) {
    logger?.warn('Discovery response was not valid JSON', { error: parsed.error });
    return {
      message: "I couldn't parse that. Could you describe your project in a few sentences?",
      advance: false,
      data: {},
    };
  }
  const data = parsed.data as {
    needsClarification?: boolean;
    questions?: unknown[];
    conversationalMessage?: string;
    projectBrief?: unknown;
  };
  const message =
    data.conversationalMessage ?? response.text?.slice(0, 500) ?? 'Thanks for the details.';
  const needsClarification = data.needsClarification === true;
  const questions: RequirementContext['pendingQuestions'] = [];
  if (Array.isArray(data.questions)) {
    for (const q of data.questions) {
      const validated = questionSchema.safeParse(q);
      if (validated.success) questions.push(validated.data);
    }
  }
  let projectBrief: RequirementContext['projectBrief'] = null;
  if (data.projectBrief && !needsClarification) {
    const pb = projectBriefSchema.safeParse(data.projectBrief);
    if (pb.success) projectBrief = pb.data;
  }
  logger?.debug('Discovery stage complete', {
    advance: !needsClarification && projectBrief !== null,
    hasProjectBrief: !!projectBrief,
    questionsCount: questions.length,
  });
  return {
    message,
    questions: questions.length ? questions : undefined,
    advance: !needsClarification && projectBrief !== null,
    data: {
      ...(projectBrief && { projectBrief }),
      pendingQuestions: questions,
    },
  };
}
