/**
 * Context pruner: automatic context window management.
 * Adapted from redxpilot's context-pruner. Deterministic (no LLM call).
 *
 * When estimated tokens exceed the budget, older messages are replaced
 * with a compact summary, keeping recent messages and the system prompt intact.
 */

import type { ModelMessage } from '../types/common';
import type { Logger } from '../types/common';
import { estimateMessagesTokens } from './token-estimator';
import { summarizeMessages } from './message-summarizer';
import { truncateText } from './text-truncator';

const TOKEN_FUDGE_FACTOR = 1_000;
const DEFAULT_MAX_CONTEXT_TOKENS = 200_000;
const TARGET_SUMMARY_RATIO = 0.1;
const KEEP_RECENT_COUNT = 4;

export interface PruneOptions {
  maxContextTokens?: number;
  keepRecentCount?: number;
  logger?: Logger;
}

export interface PruneResult {
  pruned: boolean;
  beforeTokens: number;
  afterTokens: number;
}

/**
 * Prune a message array in-place when it exceeds the token budget.
 *
 * Strategy:
 * 1. Estimate token count of all messages.
 * 2. If under budget, return immediately (no-op).
 * 3. Otherwise, summarize older messages into a compact summary.
 * 4. Replace the messages array contents with [system, summary, ...recent].
 */
export function pruneContext(messages: ModelMessage[], options?: PruneOptions): PruneResult {
  const maxTokens = options?.maxContextTokens ?? DEFAULT_MAX_CONTEXT_TOKENS;
  const keepRecent = options?.keepRecentCount ?? KEEP_RECENT_COUNT;
  const logger = options?.logger;

  const beforeTokens = estimateMessagesTokens(messages);

  if (beforeTokens + TOKEN_FUDGE_FACTOR <= maxTokens) {
    return { pruned: false, beforeTokens, afterTokens: beforeTokens };
  }

  logger?.info('Context pruning triggered', { beforeTokens, maxTokens });

  const systemMsg = messages[0];
  if (!systemMsg) return { pruned: false, beforeTokens, afterTokens: beforeTokens };
  const conversationMsgs = messages.slice(1);

  const { summary, kept } = summarizeMessages(conversationMsgs, keepRecent);

  const maxSummaryTokens = Math.floor(maxTokens * TARGET_SUMMARY_RATIO);
  const maxSummaryChars = maxSummaryTokens * 3;
  const truncatedSummary = truncateText(summary, maxSummaryChars);

  const summaryMessage: ModelMessage = {
    role: 'user',
    content: buildSummaryContent(truncatedSummary),
  } as ModelMessage;

  const newMessages: ModelMessage[] = [systemMsg, summaryMessage, ...kept];
  const afterTokens = estimateMessagesTokens(newMessages);

  messages.length = 0;
  messages.push(...newMessages);

  logger?.info('Context pruned', {
    beforeTokens,
    afterTokens,
    summarizedCount: conversationMsgs.length - kept.length,
    keptCount: kept.length,
  });

  return { pruned: true, beforeTokens, afterTokens };
}

function buildSummaryContent(summaryText: string): string {
  return [
    '<conversation_summary>',
    'This is a summary of the conversation so far.',
    'The original messages have been condensed to save context space.',
    '',
    summaryText,
    '</conversation_summary>',
    '',
    'Please continue from here.',
    'You may need to re-gather context before proceeding.',
  ].join('\n');
}
