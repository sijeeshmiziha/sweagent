/**
 * Response selection strategies for best-of-N generation.
 * Supports heuristic (length-based) and LLM-as-judge selection.
 */

import type { Model } from '../types/model';
import type { ModelMessage } from '../types/common';
import type { Logger } from '../types/common';

export interface SelectionResult {
  selectedIndex: number;
  selectedText: string;
  reason?: string;
}

/**
 * Select the longest response (simple heuristic: more detail = better).
 */
export function selectByLength(responses: string[]): SelectionResult {
  if (responses.length === 0) {
    return { selectedIndex: 0, selectedText: '', reason: 'no responses' };
  }
  let bestIdx = 0;
  for (let i = 1; i < responses.length; i++) {
    if ((responses[i]?.length ?? 0) > (responses[bestIdx]?.length ?? 0)) bestIdx = i;
  }
  return {
    selectedIndex: bestIdx,
    selectedText: responses[bestIdx] ?? '',
    reason: 'longest response',
  };
}

export interface JudgeOptions {
  model: Model;
  responses: string[];
  criteria: string;
  logger?: Logger;
}

/**
 * Use an LLM as a judge to pick the best response based on criteria.
 * The judge sees all candidates and returns the index of the best one.
 */
export async function selectByJudge(options: JudgeOptions): Promise<SelectionResult> {
  const { model, responses, criteria, logger } = options;

  const candidateList = responses.map((r, i) => `--- Candidate ${i} ---\n${r}`).join('\n\n');

  const messages: ModelMessage[] = [
    {
      role: 'system',
      content: [
        'You are a judge selecting the best response.',
        `Criteria: ${criteria}`,
        'Reply with ONLY the candidate number (0-indexed) of the best response.',
      ].join('\n'),
    } as ModelMessage,
    {
      role: 'user',
      content: `Select the best candidate:\n\n${candidateList}`,
    } as ModelMessage,
  ];

  logger?.debug('Running LLM judge', { candidateCount: responses.length });
  const result = await model.invoke(messages, {});
  const idx = parseInt(result.text.trim(), 10);
  const selectedIndex = isNaN(idx) || idx < 0 || idx >= responses.length ? 0 : idx;

  return {
    selectedIndex,
    selectedText: responses[selectedIndex] ?? '',
    reason: `judge selected candidate ${selectedIndex}`,
  };
}
