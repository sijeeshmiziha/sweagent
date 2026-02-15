/**
 * Plan validator - LLM-based check whether a plan is implementation-ready
 * for an AI coding agent. Returns { valid, feedback? }.
 */

import type { Logger } from '../../lib/types/common';
import type { Model } from '../../lib/types/model';
import type { PlanValidationResult } from './types';

const MAX_PLAN_CHARS = 12_000;

const VALIDATOR_SYSTEM_PROMPT = `You evaluate implementation plans for an AI coding agent.
The plan is the first step before a coding agent starts writing code.

Output ONLY valid JSON: { "valid": boolean, "feedback": "string" }

Set "valid" to true ONLY if ALL of these criteria are met:
1. Clear project overview and scope defined
2. Tech stack specified (languages, frameworks, database, auth approach)
3. Implementation order or phased steps present
4. Concrete actionable steps (files, routes, APIs, or models mentioned)
5. Data model, authentication, and API surface addressed

Set "valid" to false and provide short feedback explaining what is missing.

Do NOT output anything other than the JSON object.`;

function buildValidatorPrompt(planMarkdown: string): string {
  const truncated =
    planMarkdown.length > MAX_PLAN_CHARS
      ? planMarkdown.slice(0, MAX_PLAN_CHARS) + '\n\n... (truncated)'
      : planMarkdown;
  return `Evaluate this implementation plan:\n\n${truncated}`;
}

function extractJson(text: string | undefined): string {
  if (!text) return '';
  const match = /\{[\s\S]*\}/.exec(text);
  return match ? match[0] : '';
}

function parseValidationResponse(raw: string): PlanValidationResult {
  const jsonStr = extractJson(raw);
  if (!jsonStr) return { valid: false, feedback: 'Validator returned no JSON.' };
  try {
    const parsed = JSON.parse(jsonStr) as Record<string, unknown>;
    if (typeof parsed.valid !== 'boolean') {
      return { valid: false, feedback: 'Validator response missing "valid" boolean.' };
    }
    return {
      valid: parsed.valid,
      feedback: typeof parsed.feedback === 'string' ? parsed.feedback : undefined,
    };
  } catch {
    return { valid: false, feedback: 'Failed to parse validator JSON response.' };
  }
}

/**
 * Validate a plan markdown using an LLM judge.
 * Returns { valid: true } if the plan is implementation-ready for a coding agent.
 */
export async function validatePlanForCodingAgent(
  planMarkdown: string,
  model: Model,
  logger?: Logger
): Promise<PlanValidationResult> {
  logger?.info('Validating plan for coding agent');

  if (!planMarkdown || planMarkdown.length < 100) {
    return { valid: false, feedback: 'Plan is too short or empty.' };
  }

  try {
    const response = await model.invoke(
      [
        { role: 'system' as const, content: VALIDATOR_SYSTEM_PROMPT },
        { role: 'user' as const, content: buildValidatorPrompt(planMarkdown) },
      ],
      { temperature: 0, maxOutputTokens: 512 }
    );
    const result = parseValidationResponse(response.text ?? '');
    logger?.info('Plan validation result', { valid: result.valid, feedback: result.feedback });
    return result;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger?.error('Plan validation failed', { error: msg });
    return { valid: false, feedback: `Validation error: ${msg}` };
  }
}
