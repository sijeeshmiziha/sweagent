/**
 * express-builder module types
 */

import type { AgentStep } from '../../lib/types/agent';
import type { Logger } from '../../lib/types/common';
import type { ModelConfig } from '../../lib/types/model';

export interface ExpressBuilderAgentConfig {
  /** Data model, API design, and project requirements */
  input: string;
  /** Model config; optional */
  model?: ModelConfig;
  /** Max iterations; default 15 */
  maxIterations?: number;
  /** Callback for each step */
  onStep?: (step: AgentStep) => void;
  /** Optional logger for execution logs */
  logger?: Logger;
}
