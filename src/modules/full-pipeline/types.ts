/**
 * Full pipeline types - config and result shapes for the end-to-end pipeline.
 */

import type { AgentStep } from '../../lib/types/agent';
import type { ModelConfig } from '../../lib/types/model';
import type { Logger } from '../../lib/types/common';

/** Configuration for running the full pipeline. */
export interface FullPipelineConfig {
  /** Natural language description of the app to build. */
  input: string;
  /** Optional model override (defaults to openai/gpt-4o-mini). */
  model?: ModelConfig;
  /** Max iterations per agent step (defaults to 15). */
  maxIterations?: number;
  /** Callback invoked after each agent step. */
  onStep?: (step: AgentStep) => void;
  /** Optional logger for pipeline execution. */
  logger?: Logger;
}

/** Result of a single pipeline step. */
export interface PipelineStepResult {
  name: string;
  key: string;
  output: string;
}

/** Internal config passed to each pipeline step runner. */
export interface StepRunConfig {
  model?: ModelConfig;
  maxIterations: number;
  onStep?: (step: AgentStep) => void;
  logger?: Logger;
}
