/**
 * Agent loop: model + tools, AI SDK message shapes
 */

import type { AgentConfig, AgentResult, AgentStep, AgentToolResult } from '../types/agent';
import type { ModelMessage } from '../types/common';
import type { ModelToolCall } from '../types/model';
import { AgentError } from '../utils/errors';
import { sumTokenUsage } from '../utils/utils';
import { executeToolByName } from '../tools';
import { notifyObserversStep, notifyObserversTool, notifyObserversError } from './agent-observers';

/**
 * Run an agent with the given configuration.
 *
 * 1. Calls the model with ModelMessage[] and tools
 * 2. If no tool calls, returns the response
 * 3. If tool calls, executes them and appends assistant + tool messages (AI SDK shape)
 * 4. Repeats until done or max iterations reached
 *
 * @example
 * ```typescript
 * const result = await runAgent({
 *   model: createModel({ provider: 'openai', model: 'gpt-4o' }),
 *   tools: createToolSet({ search: searchTool, calculator: calculatorTool }),
 *   systemPrompt: 'You are a helpful assistant.',
 *   input: 'What is 2 + 2?',
 *   maxIterations: 10
 * });
 * console.log(result.output);
 * ```
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
    logger?.debug('Agent iteration', { iteration });

    const response = await model.invoke(messages, { tools });

    const step: AgentStep = {
      iteration,
      content: response.text,
      toolCalls: response.toolCalls,
      usage: response.usage,
    };

    if (response.text) {
      logger?.debug('Model response', { iteration, textLength: response.text.length });
    }

    if (!response.toolCalls?.length) {
      steps.push(step);
      onStep?.(step);
      notifyObserversStep(observers, step);
      logger?.info('Agent completed', {
        steps: steps.length,
        totalUsage: sumTokenUsage(steps.map(s => s.usage)),
      });
      return {
        output: response.text,
        steps,
        totalUsage: sumTokenUsage(steps.map(s => s.usage)),
        messages,
      };
    }

    logger?.debug('Tool calls', {
      iteration,
      toolCalls: response.toolCalls.map((tc: ModelToolCall) => ({
        name: tc.toolName,
        toolCallId: tc.toolCallId,
      })),
    });

    const assistantContent = [
      ...(response.text ? [{ type: 'text' as const, text: response.text }] : []),
      ...response.toolCalls.map((tc: ModelToolCall) => ({
        type: 'tool-call' as const,
        toolCallId: tc.toolCallId,
        toolName: tc.toolName,
        input: tc.input,
      })),
    ];
    messages.push({ role: 'assistant', content: assistantContent });

    const toolResults: AgentToolResult[] = [];

    for (const toolCall of response.toolCalls) {
      const execResult = await executeToolByName(tools, toolCall.toolName, toolCall.input, {
        toolCallId: toolCall.toolCallId,
        logger,
      });

      const agentResult: AgentToolResult = {
        toolCallId: toolCall.toolCallId,
        toolName: toolCall.toolName,
        output: execResult.success ? execResult.output : execResult.error,
        isError: !execResult.success,
      };
      toolResults.push(agentResult);
      notifyObserversTool(observers, toolCall.toolName, agentResult.output);

      const outputVal = agentResult.isError
        ? { type: 'error-text' as const, value: String(agentResult.output) }
        : {
            type: 'text' as const,
            value:
              typeof agentResult.output === 'string'
                ? agentResult.output
                : JSON.stringify(agentResult.output),
          };

      messages.push({
        role: 'tool',
        content: [
          {
            type: 'tool-result' as const,
            toolCallId: toolCall.toolCallId,
            toolName: toolCall.toolName,
            output: outputVal,
          },
        ],
      });
    }

    step.toolResults = toolResults;
    steps.push(step);
    onStep?.(step);
    notifyObserversStep(observers, step);
  }

  const err = new AgentError(
    `Agent reached maximum iterations (${maxIterations}) without completing`,
    maxIterations - 1
  );
  notifyObserversError(observers, err);
  logger?.error('Agent failed: max iterations reached', { maxIterations, error: err });
  throw err;
}
