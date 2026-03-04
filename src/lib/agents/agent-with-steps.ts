/**
 * Agent loop with handleSteps generator support.
 * Alternates between programmatic steps and LLM steps.
 */

import type { AgentConfig, AgentResult, AgentStep } from '../types/agent';
import type { ModelMessage } from '../types/common';
import { AgentError } from '../utils/errors';
import { sumTokenUsage } from '../utils/utils';
import {
  notifyObserversStep,
  notifyObserversTool,
  notifyObserversError,
  notifyObserversBudgetWarning,
} from './agent-observers';
import { executeToolCalls } from './agent-tool-executor';
import { runProgrammaticStep } from './programmatic-step';
import { generateNResponses } from './best-of-n';
import { pruneContext } from '../context';

/**
 * Run an agent that uses handleSteps for hybrid programmatic+LLM control.
 * The generator decides when to execute tools and when to hand off to the LLM.
 */
export async function runAgentWithSteps(config: AgentConfig): Promise<AgentResult> {
  const {
    model,
    tools,
    systemPrompt,
    input,
    maxIterations = 10,
    observers,
    logger,
    maxContextTokens,
    tokenBudget,
    handleSteps,
    stepPrompt,
  } = config;

  if (!handleSteps) {
    throw new AgentError('runAgentWithSteps requires handleSteps in config');
  }

  logger?.info('Starting agent with handleSteps', { maxIterations });

  const messages: ModelMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: input },
  ];
  const steps: AgentStep[] = [];
  const generator = handleSteps({ input, logger });

  let lastToolResult: unknown;
  let stepsComplete = false;
  let nResponses: string[] | undefined;

  for (let iteration = 0; iteration < maxIterations; iteration++) {
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

    const action = await runProgrammaticStep({
      generator,
      tools,
      messages,
      steps,
      logger,
      lastToolResult,
      stepsComplete,
      nResponses,
    });

    if (action.type === 'done') {
      const totalUsage = sumTokenUsage(steps.map(s => s.usage));
      return { output: steps.at(-1)?.content ?? '', steps, totalUsage, messages };
    }

    if (action.type === 'generate_n') {
      const genResult = await generateNResponses({
        model,
        messages,
        n: action.n,
        invokeOptions: { tools },
        logger,
      });
      nResponses = genResult.texts;
      lastToolResult = undefined;
      stepsComplete = false;
      continue;
    }

    const stepAll = action.type === 'step_all';
    const result = await runLlmStep(config, messages, steps, stepAll, iteration, stepPrompt);
    lastToolResult = undefined;
    stepsComplete = result.stepsComplete;
    nResponses = undefined;
  }

  const err = new AgentError(
    `Agent reached maximum iterations (${maxIterations})`,
    maxIterations - 1
  );
  notifyObserversError(observers, err);
  throw err;
}

async function runLlmStep(
  config: AgentConfig,
  messages: ModelMessage[],
  steps: AgentStep[],
  stepAll: boolean,
  iteration: number,
  stepPrompt?: string
): Promise<{ stepsComplete: boolean }> {
  const { model, tools, onStep, observers, logger } = config;

  if (stepPrompt) {
    messages.push({ role: 'user', content: stepPrompt } as ModelMessage);
  }

  const response = await model.invoke(messages, { tools });
  const step: AgentStep = {
    iteration,
    content: response.text,
    toolCalls: response.toolCalls,
    usage: response.usage,
  };

  if (!response.toolCalls?.length) {
    steps.push(step);
    onStep?.(step);
    notifyObserversStep(observers, step);
    return { stepsComplete: true };
  }

  const toolResults = await executeToolCalls({
    tools,
    toolCalls: response.toolCalls,
    messages,
    logger,
    onToolResult: (name, output) => {
      notifyObserversTool(observers, name, output);
    },
  });
  step.toolResults = toolResults;
  steps.push(step);
  onStep?.(step);
  notifyObserversStep(observers, step);

  return { stepsComplete: !stepAll };
}
