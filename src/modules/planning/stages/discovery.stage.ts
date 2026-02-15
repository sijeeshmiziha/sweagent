/**
 * Discovery stage - understand project, optional questions; output is raw markdown
 */

import type { Logger } from '../../../lib/types/common';
import type { Model } from '../../../lib/types/model';
import type { PlanningContext, PlanStageResult } from '../types';
import {
  PLANNING_SYSTEM_PROMPT,
  DISCOVERY_SYSTEM_FRAGMENT,
  buildDiscoveryPrompt,
} from '../prompts';
import { isConfirmation } from './base';

/** Heuristic: response contains project overview (markdown headers we expect when ready to advance) */
function hasProjectOverview(text: string): boolean {
  const t = text.trim();
  if (t.length < 100) return false;
  // Primary: exact markdown headers
  if (t.includes('## Overview') || t.includes('## Core Features')) return true;
  // Secondary: bold-label or h1 variants the LLM might use
  const lower = t.toLowerCase();
  if (
    (lower.includes('overview') || lower.includes('core features')) &&
    (lower.includes('tech stack') || lower.includes('technology'))
  ) {
    return true;
  }
  return false;
}

export async function runDiscoveryStage(
  userMessage: string,
  context: PlanningContext,
  model: Model,
  logger?: Logger
): Promise<PlanStageResult> {
  logger?.debug('Discovery stage started', { historyLength: context.history.length });

  // Exclude the last entry from history if it duplicates the current userMessage
  // (processPlanningChat calls addChatEntry before runStage)
  const historyEntries = context.history.slice(0, -1);
  const history = historyEntries
    .map(e => `${e.role}: ${e.content}`)
    .slice(-10)
    .join('\n');
  const prompt = buildDiscoveryPrompt(userMessage, history);
  const systemContent = `${PLANNING_SYSTEM_PROMPT}\n\n${DISCOVERY_SYSTEM_FRAGMENT}`;
  const messages = [
    { role: 'system' as const, content: systemContent },
    { role: 'user' as const, content: prompt },
  ];
  const response = await model.invoke(messages, { temperature: 0.4, maxOutputTokens: 4096 });
  const message = response.text?.trim() ?? '';

  const hasOverview = hasProjectOverview(message);
  const userConfirmed = isConfirmation(userMessage);
  // Safety net: after enough discovery turns with confirmations, force advance
  const forceAdvance = userConfirmed && context.history.length >= 7 && message.length > 50;
  // Advance when: (1) we got overview, (2) user confirmed & description exists, or (3) safety net
  const advance =
    (hasOverview && (context.projectDescription == null || userConfirmed)) ||
    (userConfirmed && context.projectDescription != null) ||
    forceAdvance;
  const storeDescription = hasOverview || (forceAdvance && message.length > 50);

  logger?.debug('Discovery stage complete', {
    advance,
    hasOverview,
    userConfirmed,
    forceAdvance,
  });

  return {
    message,
    advance,
    sections: {},
    ...(storeDescription && { projectDescription: message }),
  };
}
