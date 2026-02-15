/**
 * Config for runPlanningFromRequirements - accepts a FinalRequirement
 * from the requirement-gatherer and produces a plan, skipping redundant stages.
 */

import type { AgentStep } from '../../lib/types/agent';
import type { Logger } from '../../lib/types/common';
import type { ModelConfig } from '../../lib/types/model';
import type { FinalRequirement } from '../requirement-gatherer/types';

export interface PlanFromRequirementsConfig {
  /** Structured requirement document from the requirement-gatherer module */
  requirement: FinalRequirement;
  /** Model config; defaults to gpt-4o-mini */
  model?: ModelConfig;
  /** Callback for each step */
  onStep?: (step: AgentStep) => void;
  /** Optional logger */
  logger?: Logger;
}
