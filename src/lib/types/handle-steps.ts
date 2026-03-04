/**
 * Types for the handleSteps generator pattern.
 * Adapted from redxpilot's AgentDefinition.handleSteps.
 *
 * A generator that yields tool calls (executed programmatically),
 * 'STEP' (one LLM call), 'STEP_ALL' (LLM until done),
 * or GENERATE_N (multiple LLM responses for best-of-N).
 */

import type { AgentStep } from './agent';
import type { ModelMessage } from './common';
import type { Logger } from './common';

/** Yield this to run the LLM for exactly one step. */
export type StepOnce = 'STEP';

/** Yield this to run the LLM until it stops calling tools. */
export type StepAll = 'STEP_ALL';

/** Yield this to request N parallel LLM responses (best-of-N). */
export interface GenerateN {
  type: 'GENERATE_N';
  n: number;
}

/** Yield a tool call for programmatic (non-LLM) execution. */
export interface ProgrammaticToolCall {
  toolName: string;
  input: unknown;
}

/** Everything a generator can yield. */
export type HandleStepsYield = ProgrammaticToolCall | StepOnce | StepAll | GenerateN;

/** Data passed back into the generator after each yield. */
export interface HandleStepsResume {
  /** Current messages in the conversation */
  messages: ModelMessage[];
  /** Result of the last tool call (if the yield was a tool call) */
  toolResult?: unknown;
  /** Whether the LLM indicated it's done (for STEP_ALL) */
  stepsComplete: boolean;
  /** Responses from GENERATE_N */
  nResponses?: string[];
  /** Steps taken so far */
  steps: AgentStep[];
}

/** Context passed to the handleSteps generator function. */
export interface HandleStepsContext {
  /** The user's input */
  input: string;
  /** Additional params passed to the agent */
  params?: Record<string, unknown>;
  logger?: Logger;
}

/** The generator type for handleSteps. */
export type HandleStepsGenerator = Generator<HandleStepsYield, void, HandleStepsResume>;

/** The function signature for handleSteps. */
export type HandleStepsFn = (context: HandleStepsContext) => HandleStepsGenerator;
