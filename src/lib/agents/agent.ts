/**
 * Agent loop: model + tools, AI SDK message shapes
 */

import type { AgentConfig, AgentResult, AgentStep } from '../types/agent';
import type { ModelMessage } from '../types/common';
import type { ModelToolCall } from '../types/model';
import { AgentError } from '../utils/errors';
import { sumTokenUsage } from '../utils/utils';
import {
  notifyObserversStep,
  notifyObserversTool,
  notifyObserversError,
  notifyObserversBudgetWarning,
} from './agent-observers';
import { executeToolCalls } from './agent-tool-executor';
import { pruneContext } from '../context';

/**
 * Run an agent loop: invoke model, execute tools, repeat until done.
 * Supports context pruning (maxContextTokens) and token budgets.
 */
export async function runAgent(config: AgentConfig): Promise<AgentResult> {
  const {
    model,
    tools,
    systemPrompt,
    input,
    maxIterations = 10,
    onStep,
    observers,
    logger,
    maxContextTokens,
    tokenBudget,
  } = config;

  logger?.info('Starting agent', { maxIterations });

  const messages: ModelMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: input },
  ];

  const steps: AgentStep[] = [];

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    if (iteration > 0 && iteration >= maxIterations - 2) {
      logger?.warn('Approaching max iterations', { iteration, maxIterations });
    }

    if (maxContextTokens && iteration > 0) {
      pruneContext(messages, { maxContextTokens, logger });
    }

    const cumulative = sumTokenUsage(steps.map(s => s.usage));
    const used = cumulative.totalTokens ?? 0;
    if (tokenBudget) {
      if (used >= tokenBudget) {
        logger?.warn('Token budget exhausted', { used, tokenBudget });
        notifyObserversBudgetWarning(observers, used, tokenBudget);
        return { output: steps.at(-1)?.content ?? '', steps, totalUsage: cumulative, messages };
      }
      if (used >= tokenBudget * 0.8) {
        notifyObserversBudgetWarning(observers, used, tokenBudget);
      }
    }

    logger?.debug('Agent iteration', { iteration });
    const response = await model.invoke(messages, { tools });

    const step: AgentStep = {
      iteration,
      content: response.text,
      toolCalls: response.toolCalls,
      usage: response.usage,
    };

    if (!response.toolCalls?.length) {
      step.cumulativeUsage = sumTokenUsage(steps.map(s => s.usage).concat(step.usage));
      steps.push(step);
      onStep?.(step);
      notifyObserversStep(observers, step, step.cumulativeUsage);
      const totalUsage = step.cumulativeUsage;
      logger?.info('Agent completed', { steps: steps.length, totalUsage });
      return { output: response.text, steps, totalUsage, messages };
    }

    logger?.debug('Tool calls', {
      iteration,
      toolCalls: response.toolCalls.map((tc: ModelToolCall) => ({
        name: tc.toolName,
        toolCallId: tc.toolCallId,
      })),
    });

    const toolResults = await executeToolCalls({
      tools,
      toolCalls: response.toolCalls,
      messages,
      logger,
      responseText: response.text || undefined,
      onToolResult: (name, output) => {
        notifyObserversTool(observers, name, output);
      },
    });

    step.toolResults = toolResults;
    step.cumulativeUsage = sumTokenUsage(steps.map(s => s.usage).concat(step.usage));
    steps.push(step);
    onStep?.(step);
    notifyObserversStep(observers, step, step.cumulativeUsage);
  }

  const err = new AgentError(
    `Agent reached maximum iterations (${maxIterations}) without completing`,
    maxIterations - 1
  );
  notifyObserversError(observers, err);
  logger?.error('Agent failed: max iterations reached', { maxIterations, error: err });
  throw err;
}
