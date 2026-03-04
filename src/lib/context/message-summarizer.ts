/**
 * Rule-based message summarization.
 * Adapted from redxpilot's context-pruner: deterministic summarization
 * per message role, keeping errors and key tool results.
 */

import type { ModelMessage } from '../types/common';
import { truncateText } from './text-truncator';

const USER_TEXT_LIMIT = 15_000;
const ASSISTANT_TEXT_LIMIT = 4_000;
const TOOL_ERROR_LIMIT = 200;
const TOOL_RESULT_LIMIT = 2_000;

interface ContentPart {
  type: string;
  text?: string;
  toolName?: string;
  toolCallId?: string;
  input?: unknown;
  output?: { type?: string; value?: string };
}

/**
 * Summarize a single message based on its role.
 * Returns a plain-text summary string.
 */
export function summarizeMessage(message: ModelMessage): string {
  const role = (message as { role: string }).role;
  const content = (message as { content: unknown }).content;

  switch (role) {
    case 'system':
      return '[SYSTEM] (preserved)';
    case 'user':
      return summarizeUserMessage(content);
    case 'assistant':
      return summarizeAssistantMessage(content);
    case 'tool':
      return summarizeToolMessage(content);
    default:
      return `[${role.toUpperCase()}]`;
  }
}

function summarizeUserMessage(content: unknown): string {
  const text = extractText(content);
  return `[USER] ${truncateText(text, USER_TEXT_LIMIT)}`;
}

function summarizeAssistantMessage(content: unknown): string {
  if (typeof content === 'string') {
    return `[ASSISTANT] ${truncateText(content, ASSISTANT_TEXT_LIMIT)}`;
  }
  if (!Array.isArray(content)) return '[ASSISTANT]';

  const parts: string[] = [];
  const toolCalls: string[] = [];

  for (const part of content as ContentPart[]) {
    if (part.type === 'text' && part.text) {
      parts.push(truncateText(part.text, ASSISTANT_TEXT_LIMIT));
    } else if (part.type === 'tool-call' && part.toolName) {
      toolCalls.push(part.toolName);
    }
  }

  const text = parts.join(' ');
  const tools = toolCalls.length ? ` | Tools: ${toolCalls.join(', ')}` : '';
  return `[ASSISTANT] ${text}${tools}`;
}

function summarizeToolMessage(content: unknown): string {
  if (!Array.isArray(content)) return '[TOOL]';

  const summaries: string[] = [];
  for (const part of content as ContentPart[]) {
    if (part.type !== 'tool-result') continue;

    const name = part.toolName ?? 'unknown';
    const outputType = part.output?.type;
    const value = part.output?.value ?? '';

    if (outputType === 'error-text') {
      summaries.push(`[TOOL:${name}] ERROR: ${truncateText(value, TOOL_ERROR_LIMIT)}`);
    } else {
      summaries.push(`[TOOL:${name}] ${truncateText(value, TOOL_RESULT_LIMIT)}`);
    }
  }

  return summaries.join('\n') || '[TOOL]';
}

function extractText(content: unknown): string {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return (content as ContentPart[])
      .filter(
        (p): p is ContentPart & { text: string } => p.type === 'text' && typeof p.text === 'string'
      )
      .map(p => p.text)
      .join(' ');
  }
  if (content == null) return '';
  return JSON.stringify(content);
}

/**
 * Summarize an array of messages into a single conversation summary string.
 * Preserves the most recent `keepRecentCount` messages verbatim.
 */
export function summarizeMessages(
  messages: ModelMessage[],
  keepRecentCount = 4
): { summary: string; kept: ModelMessage[] } {
  if (messages.length <= keepRecentCount) {
    return { summary: '', kept: messages };
  }

  const toSummarize = messages.slice(0, -keepRecentCount);
  const kept = messages.slice(-keepRecentCount);

  const lines = toSummarize.map(summarizeMessage);
  const summary = lines.join('\n');

  return { summary, kept };
}
