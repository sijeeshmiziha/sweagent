/**
 * Synthesis stage - compile FinalRequirement document
 */

import type { Logger } from '../../../lib/types/common';
import type { Model } from '../../../lib/types/model';
import type { RequirementContext, StageResult } from '../types';
import type { FinalRequirement } from '../types';
import { finalRequirementSchema } from '../schemas';
import { REQUIREMENT_GATHERER_SYSTEM_PROMPT } from '../prompts';
import { SYNTHESIS_SYSTEM_FRAGMENT, buildSynthesisPrompt } from '../prompts';
import { extractJson, safeParseJson } from './base';

export async function runSynthesisStage(
  _userMessage: string,
  context: RequirementContext,
  model: Model,
  logger?: Logger
): Promise<StageResult> {
  logger?.debug('Synthesis stage started');

  const brief = context.projectBrief;
  if (!brief || !context.database || !context.apiDesign) {
    return {
      message:
        'Missing project brief, database design, or API design. Complete earlier stages first.',
      advance: false,
      data: {},
    };
  }
  const prompt = buildSynthesisPrompt(
    JSON.stringify(brief),
    JSON.stringify(context.actors),
    JSON.stringify(context.flows),
    JSON.stringify(context.stories),
    JSON.stringify(context.modules),
    JSON.stringify(context.database),
    JSON.stringify(context.apiDesign)
  );
  const systemContent = `${REQUIREMENT_GATHERER_SYSTEM_PROMPT}\n\n${SYNTHESIS_SYSTEM_FRAGMENT}`;
  const messages = [
    { role: 'system' as const, content: systemContent },
    { role: 'user' as const, content: prompt },
  ];
  const response = await model.invoke(messages, { temperature: 0.3, maxOutputTokens: 16384 });
  const jsonStr = extractJson(response.text);
  const parsed = safeParseJson(jsonStr);
  if (!parsed.success) {
    logger?.warn('Synthesis response was not valid JSON', { error: parsed.error });
    return {
      message: 'Failed to compile final requirement document. Please try again.',
      advance: false,
      data: {},
    };
  }
  const validated = finalRequirementSchema.safeParse(parsed.data);
  if (!validated.success) {
    logger?.warn('Synthesis: final requirement schema validation failed', {
      error: validated.error.message,
    });
    return {
      message: 'Final document did not match schema. ' + (response.text?.slice(0, 300) ?? ''),
      advance: false,
      data: {},
    };
  }
  const finalRequirement: FinalRequirement = validated.data;
  logger?.info('Synthesis stage complete', { overview: finalRequirement.summary?.overview });
  return {
    message: `Requirement document ready. ${finalRequirement.summary.overview}`,
    advance: true,
    data: { finalRequirement },
  };
}
