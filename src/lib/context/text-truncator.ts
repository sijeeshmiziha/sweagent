/**
 * Text truncation utilities.
 * Adapted from redxpilot's context-pruner: 80/20 truncation preserves
 * the beginning (most context) and end (most recent) of long text.
 */

const TRUNCATION_OVERHEAD = 50;
const PREFIX_RATIO = 0.8;

/**
 * Truncate text that exceeds `limit` characters.
 * Keeps 80% from the start and 20% from the end, with a marker in between.
 */
export function truncateText(text: string, limit: number): string {
  if (text.length <= limit) return text;

  const available = limit - TRUNCATION_OVERHEAD;
  if (available <= 0) return text.slice(0, limit);

  const prefixLen = Math.floor(available * PREFIX_RATIO);
  const suffixLen = available - prefixLen;
  const prefix = text.slice(0, prefixLen);
  const suffix = text.slice(-suffixLen);
  const omitted = text.length - prefixLen - suffixLen;

  return `${prefix}\n\n[...truncated ${omitted} chars...]\n\n${suffix}`;
}

/**
 * Truncate text to a target token count (approximate).
 * Converts token limit to a character limit and delegates to truncateText.
 */
export function truncateToTokens(text: string, maxTokens: number): string {
  const charLimit = maxTokens * 3;
  return truncateText(text, charLimit);
}
