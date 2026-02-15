/**
 * backend-architect module types
 */

import type { AgentStep } from '../../lib/types/agent';
import type { Logger } from '../../lib/types/common';
import type { ModelConfig } from '../../lib/types/model';

export interface BackendArchitectAgentConfig {
  /** Project requirements, data model, and API design context */
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
