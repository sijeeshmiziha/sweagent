/**
 * Token estimation utilities.
 * Adapted from redxpilot's context-pruner: approximate token count
 * from JSON-serialized length (1 token ≈ 3 characters).
 */

const CHARS_PER_TOKEN = 3;

/**
 * Estimate the number of tokens in an arbitrary value by serializing to JSON.
 * Useful for budget checks without calling a tokenizer.
 */
export function estimateTokens(value: unknown): number {
  if (value === undefined || value === null) return 0;
  const serialized = typeof value === 'string' ? value : JSON.stringify(value);
  return Math.ceil(serialized.length / CHARS_PER_TOKEN);
}

/**
 * Estimate total tokens in a message array (the main context window).
 */
export function estimateMessagesTokens(messages: unknown[]): number {
  let total = 0;
  for (const msg of messages) {
    total += estimateTokens(msg);
  }
  return total;
}
