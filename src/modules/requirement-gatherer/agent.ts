/**
 * runRequirementGathererAgent - one-shot wrapper around processRequirementChat
 * Runs the full chat flow non-interactively, auto-advancing with "continue" when questions are asked.
 */

import type { RequirementGathererAgentConfig } from './types';
import type { AgentResult } from '../../lib/types/agent';
import { processRequirementChat } from './chat';

const MAX_TURNS = 10;

/**
 * Run the requirement gatherer in one-shot mode: single input, auto-advance through stages,
 * return final requirement document or last message as AgentResult.
 */
export async function runRequirementGathererAgent(
  config: RequirementGathererAgentConfig
): Promise<AgentResult> {
  const { input, model: modelConfig, onStep, logger } = config;
  logger?.info('Starting requirement gatherer agent', { maxTurns: MAX_TURNS });

  let context = null;
  let lastResult = await processRequirementChat(input, context, {
    model: modelConfig,
    onStep,
    logger,
  });
  context = lastResult.context;
  let turns = 1;
  while (!lastResult.finalRequirement && turns < MAX_TURNS) {
    logger?.debug('Requirement gatherer turn', { turn: turns });
    lastResult = await processRequirementChat('continue', context, {
      model: modelConfig,
      onStep,
      logger,
    });
    context = lastResult.context;
    turns++;
  }
  const output = lastResult.finalRequirement
    ? JSON.stringify(lastResult.finalRequirement, null, 2)
    : lastResult.message;
  const messages = context.history.map(e => ({
    role: e.role as 'user' | 'system' | 'assistant',
    content: e.content,
  }));

  logger?.info('Requirement gatherer agent completed', {
    turns,
    hasFinalRequirement: !!lastResult.finalRequirement,
  });
  return {
    output,
    steps: [],
    totalUsage: undefined,
    messages,
  };
}
