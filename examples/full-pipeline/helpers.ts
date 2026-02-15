/**
 * Shared helpers for full-pipeline examples.
 *
 * - enrichRequirementPrompt: expands vague input into a detailed prompt
 * - gatherRequirements: wraps processRequirementChat with smarter prompts
 * - reviewStep: re-exported from shared lib (examples/lib/input.ts)
 */

import { processRequirementChat } from 'sweagent';
import type { RequirementContext, ModelConfig, Logger } from 'sweagent';

// Re-export reviewStep from the shared library
export { reviewStep } from '../lib/input.js';
export type { ReviewResult } from '../lib/input.js';

const MAX_TURNS = 12;

const ADVANCE_MSG =
  'Proceed with your best assumptions for any unanswered questions. ' +
  'Do NOT ask more questions. Advance to the next stage and generate the output.';

/** Expand vague user input into a detailed requirement prompt. */
export function enrichRequirementPrompt(rawInput: string): string {
  return (
    `Build a complete requirement document for: ${rawInput}\n\n` +
    'IMPORTANT INSTRUCTIONS:\n' +
    '- Assume reasonable defaults for ALL technical decisions.\n' +
    '- Do NOT ask clarifying questions.\n' +
    '- Infer the domain, key features, user roles, and data entities from the description.\n' +
    '- Technical defaults: MongoDB, Node.js, REST API (unless the description implies otherwise).\n' +
    '- Proceed directly to generating the full structured requirement document.\n' +
    '- Include actors, user flows, user stories, modules with CRUD APIs, and database design.'
  );
}

/** Run the requirement gatherer with enriched prompts that avoid getting stuck. */
export async function gatherRequirements(
  rawInput: string,
  modelConfig: ModelConfig,
  reqLogger?: Logger
): Promise<string> {
  const enriched = enrichRequirementPrompt(rawInput);
  reqLogger?.info('Gathering requirements with enriched prompt');

  let context: RequirementContext | null = null;
  let lastResult = await processRequirementChat(enriched, context, {
    model: modelConfig,
    logger: reqLogger,
  });
  context = lastResult.context;
  let turns = 1;

  while (!lastResult.finalRequirement && turns < MAX_TURNS) {
    reqLogger?.debug('Requirement turn', { turn: turns, stage: context.stage });
    lastResult = await processRequirementChat(ADVANCE_MSG, context, {
      model: modelConfig,
      logger: reqLogger,
    });
    context = lastResult.context;
    turns++;
  }

  reqLogger?.info('Requirements completed', {
    turns,
    hasFinalRequirement: !!lastResult.finalRequirement,
  });

  return lastResult.finalRequirement
    ? JSON.stringify(lastResult.finalRequirement, null, 2)
    : lastResult.message;
}
