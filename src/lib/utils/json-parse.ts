/**
 * Shared utilities for extracting and parsing JSON from model responses.
 *
 * Models frequently wrap JSON in markdown code blocks or include extra text.
 * These helpers handle extraction, parsing, and Zod validation with clear errors
 * so the agent can retry on failure.
 */

import type { z } from 'zod';

/**
 * Extract a JSON string from model output.
 * Handles markdown code blocks (```json ... ``` or ``` ... ```) and bare JSON.
 */
export function extractJson(text: string): string {
  const trimmed = text.trim();
  const codeBlock = /```(?:json)?\s*([\s\S]*?)```/.exec(trimmed);
  if (codeBlock?.[1]) return codeBlock[1].trim();
  return trimmed;
}

/**
 * Parse a model text response as JSON then validate with a Zod schema.
 * Throws a descriptive error on failure (JSON syntax or validation) so the
 * wrapping ToolError gives the agent enough context to retry.
 */
export function parseModelJsonResponse<T>(text: string, schema: z.ZodType<T>): T {
  const jsonStr = extractJson(text);
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (err) {
    const preview = jsonStr.length > 300 ? jsonStr.slice(0, 300) + '...' : jsonStr;
    throw new Error(
      `Failed to parse model response as JSON: ${err instanceof Error ? err.message : String(err)}. Preview: ${preview}`
    );
  }
  const result = schema.safeParse(parsed);
  if (!result.success) {
    const issues = result.error.issues
      .slice(0, 5)
      .map(i => `  ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`Model JSON does not match expected schema:\n${issues}`);
  }
  return result.data;
}

/**
 * Parse a raw JSON string (e.g. tool input) with a descriptive error on failure.
 */
export function safeJsonParse(jsonStr: string, label?: string): unknown {
  try {
    return JSON.parse(jsonStr) as unknown;
  } catch (err) {
    const preview = jsonStr.length > 200 ? jsonStr.slice(0, 200) + '...' : jsonStr;
    throw new Error(
      `Invalid JSON${label ? ` for ${label}` : ''}: ${err instanceof Error ? err.message : String(err)}. Preview: ${preview}`
    );
  }
}
