/**
 * Discovery stage - understand project, optional clarifying questions
 */

import type { Model } from '../../../lib/types/model';
import type { RequirementContext, StageResult } from '../types';
import { projectBriefSchema, questionSchema } from '../schemas';
import { REQUIREMENT_GATHERER_SYSTEM_PROMPT } from '../prompts';
import { DISCOVERY_SYSTEM_FRAGMENT, buildDiscoveryPrompt } from '../prompts';
import { extractJson } from './base';

export async function runDiscoveryStage(
  userMessage: string,
  context: RequirementContext,
  model: Model
): Promise<StageResult> {
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
  let parsed: {
    needsClarification?: boolean;
    questions?: unknown[];
    conversationalMessage?: string;
    projectBrief?: unknown;
  };
  try {
    parsed = JSON.parse(jsonStr) as typeof parsed;
  } catch {
    return {
      message: "I couldn't parse that. Could you describe your project in a few sentences?",
      advance: false,
      data: {},
    };
  }
  const message =
    parsed.conversationalMessage ?? response.text?.slice(0, 500) ?? 'Thanks for the details.';
  const needsClarification = parsed.needsClarification === true;
  const questions: RequirementContext['pendingQuestions'] = [];
  if (Array.isArray(parsed.questions)) {
    for (const q of parsed.questions) {
      const validated = questionSchema.safeParse(q);
      if (validated.success) questions.push(validated.data);
    }
  }
  let projectBrief: RequirementContext['projectBrief'] = null;
  if (parsed.projectBrief && !needsClarification) {
    const pb = projectBriefSchema.safeParse(parsed.projectBrief);
    if (pb.success) projectBrief = pb.data;
  }
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
