/**
 * Programmatic step engine for the handleSteps generator pattern.
 * Adapted from redxpilot's run-programmatic-step.ts.
 *
 * Executes yields from a HandleStepsGenerator:
 * - Tool calls → execute programmatically, resume generator with result
 * - 'STEP' → signal caller to run one LLM step
 * - 'STEP_ALL' → signal caller to run LLM until it ends
 * - GENERATE_N → signal caller to produce N responses
 */

import type {
  HandleStepsGenerator,
  HandleStepsResume,
  ProgrammaticToolCall,
} from '../types/handle-steps';
import type { AgentStep } from '../types/agent';
import type { ModelMessage } from '../types/common';
import type { Logger } from '../types/common';
import type { ToolSet } from '../tools';
import { executeToolByName } from '../tools';

export type ProgrammaticAction =
  | { type: 'step' }
  | { type: 'step_all' }
  | { type: 'generate_n'; n: number }
  | { type: 'done' };

export interface RunProgrammaticStepOptions {
  generator: HandleStepsGenerator;
  tools: ToolSet;
  messages: ModelMessage[];
  steps: AgentStep[];
  logger?: Logger;
  lastToolResult?: unknown;
  stepsComplete?: boolean;
  nResponses?: string[];
}

/**
 * Advance the generator until it yields a control signal (STEP/STEP_ALL/GENERATE_N)
 * or completes. Tool call yields are executed inline.
 */
export async function runProgrammaticStep(
  opts: RunProgrammaticStepOptions
): Promise<ProgrammaticAction> {
  const { generator, tools, messages, steps, logger } = opts;

  const resumeData: HandleStepsResume = {
    messages,
    toolResult: opts.lastToolResult,
    stepsComplete: opts.stepsComplete ?? false,
    nResponses: opts.nResponses,
    steps,
  };

  let result = generator.next(resumeData);

  while (!result.done) {
    const yielded = result.value;

    if (yielded === 'STEP') return { type: 'step' };
    if (yielded === 'STEP_ALL') return { type: 'step_all' };

    if (typeof yielded === 'object' && 'type' in yielded && yielded.type === 'GENERATE_N') {
      return { type: 'generate_n', n: (yielded as { type: string; n: number }).n };
    }

    const toolCall = yielded as ProgrammaticToolCall;
    logger?.debug('Programmatic tool call', { toolName: toolCall.toolName });

    const exec = await executeToolByName(tools, toolCall.toolName, toolCall.input, { logger });
    const toolResult = exec.success ? exec.output : exec.error;

    result = generator.next({
      messages,
      toolResult,
      stepsComplete: false,
      steps,
    });
  }

  return { type: 'done' };
}
