/**
 * planning module types
 * Chat-based 4-stage flow: discovery -> requirements -> design -> complete
 * All LLM output is raw markdown strings; no JSON parsing or schema validation.
 */

import type { AgentStep } from '../../lib/types/agent';
import type { Logger } from '../../lib/types/common';
import type { ModelConfig, Model } from '../../lib/types/model';

/** Stage in the planning flow */
export type Stage = 'discovery' | 'requirements' | 'design' | 'complete';

/** Accumulated markdown sections -- each is a raw string from an LLM call */
export interface PlanSections {
  overview: string | null;
  techStack: string | null;
  featureDecisions: string | null;
  dataModels: string | null;
  pagesAndRoutes: string | null;
  authFlow: string | null;
  apiRoutes: string | null;
  implementation: string | null;
  executionPlan: string | null;
  edgeCases: string | null;
  testingChecklist: string | null;
}

/** Single chat message entry */
export interface ChatEntry {
  role: 'user' | 'assistant';
  content: string;
}

/** Accumulated context across chat turns */
export interface PlanningContext {
  stage: Stage;
  projectDescription: string | null;
  sections: PlanSections;
  history: ChatEntry[];
  pendingQuestions: string[];
}

/** Result of a single chat turn */
export interface PlanChatTurnResult {
  message: string;
  context: PlanningContext;
  pendingQuestions: string[];
  planMarkdown: string | null;
}

/** Config for processPlanningChat */
export interface PlanningChatConfig {
  model?: ModelConfig;
  maxIterations?: number;
  onStep?: (step: AgentStep) => void;
  logger?: Logger;
}

/** Result of a stage processor */
export interface PlanStageResult {
  message: string;
  advance: boolean;
  sections: Partial<PlanSections>;
  projectDescription?: string | null;
  pendingQuestions?: string[];
  /** Set by synthesis stage when plan is complete */
  planMarkdown?: string;
}

/** Input passed to stage process() */
export interface StageInput {
  userMessage: string;
  model: Model;
  logger?: Logger;
}

/** Config for runPlanningAgent (one-shot wrapper) */
export interface PlanningAgentConfig {
  input: string;
  model?: ModelConfig;
  maxIterations?: number;
  onStep?: (step: AgentStep) => void;
  logger?: Logger;
}

/** Config for editPlan (edit existing plan with feedback) */
export interface EditPlanConfig {
  /** Current plan.md content */
  existingPlan: string;
  /** Edit instructions or additional context */
  feedback: string;
  model?: ModelConfig;
  logger?: Logger;
}
