/**
 * runPlanningAgent - one-shot wrapper around processPlanningChat
 * Auto-advances with "continue"; returns plan markdown. Does not write to file.
 */

import type { PlanningAgentConfig } from './types';
import type { AgentResult } from '../../lib/types/agent';
import { processPlanningChat } from './chat';

const MAX_TURNS = 10;

/**
 * Run the planning agent in one-shot mode: single input, auto-advance through stages,
 * return plan markdown as AgentResult. Does not write to file.
 */
export async function runPlanningAgent(config: PlanningAgentConfig): Promise<AgentResult> {
  const { input, model: modelConfig, onStep, logger } = config;
  logger?.info('Starting planning agent', { maxTurns: MAX_TURNS });

  let context = null;
  let lastResult = await processPlanningChat(input, context, {
    model: modelConfig,
    onStep,
    logger,
  });
  context = lastResult.context;
  let turns = 1;
  while (!lastResult.planMarkdown && turns < MAX_TURNS) {
    logger?.debug('Planning agent turn', { turn: turns });
    const continueMsg =
      `continue - proceed with the project: "${input}". ` +
      'Make reasonable assumptions for any unresolved details and produce the required output format.';
    lastResult = await processPlanningChat(continueMsg, context, {
      model: modelConfig,
      onStep,
      logger,
    });
    context = lastResult.context;
    turns++;
  }
  const output = lastResult.planMarkdown ?? lastResult.message;
  const messages = context.history.map(e => ({
    role: e.role as 'user' | 'system' | 'assistant',
    content: e.content,
  }));

  logger?.info('Planning agent completed', {
    turns,
    hasPlanMarkdown: !!lastResult.planMarkdown,
  });
  return {
    output,
    steps: [],
    totalUsage: undefined,
    messages,
  };
}
