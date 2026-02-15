/**
 * execution-planner module types
 */

import type { AgentStep } from '../../lib/types/agent';
import type { Logger } from '../../lib/types/common';
import type { ModelConfig } from '../../lib/types/model';

export interface PhaseStep {
  order: number;
  action: string;
  details: string;
}

export interface ImplementationPhase {
  name: string;
  description: string;
  steps: PhaseStep[];
}

export interface EdgeCase {
  area: string;
  scenario: string;
  handling: string;
  severity: 'critical' | 'warning' | 'info';
}

export interface TestChecklistItem {
  flow: string;
  item: string;
  expectedResult: string;
}

export interface ExecutionPlan {
  phases: ImplementationPhase[];
  currentState: string;
  desiredEndState: string;
  edgeCases: EdgeCase[];
  securityNotes: string[];
  performanceNotes: string[];
  testingChecklist: TestChecklistItem[];
}

export interface ExecutionPlannerAgentConfig {
  /** User input: all plan sections to create execution plan from */
  input: string;
  /** Model config; defaults to gpt-4o-mini */
  model?: ModelConfig;
  /** Max iterations; default 15 */
  maxIterations?: number;
  /** Callback for each step */
  onStep?: (step: AgentStep) => void;
  /** Optional logger */
  logger?: Logger;
}
