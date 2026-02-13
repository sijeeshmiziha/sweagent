/**
 * requirement-gatherer module types
 */

import type { AgentStep } from '../../lib/types/agent';
import type { ModelConfig } from '../../lib/types/model';

export interface BasicProjectInfo {
  name: string;
  goal: string;
  features: string;
}

export interface Actor {
  id: string;
  name: string;
  description: string;
  goals: string[];
}

export interface ExtractedFlow {
  id: string;
  actorId: string;
  name: string;
  description: string;
  trigger: string;
  outcome: string;
}

export interface ExtractedStory {
  id: string;
  flowId: string;
  actor: string;
  action: string;
  benefit: string;
  preconditions: string[];
  postconditions: string[];
  dataInvolved: string[];
}

export interface CrudApi {
  id: string;
  name: string;
  operation: 'create' | 'read' | 'readAll' | 'update' | 'delete';
  description: string;
  inputs: string[];
  outputs: string[];
}

export interface ExtractedModule {
  id: string;
  name: string;
  description: string;
  entity: string;
  apis: CrudApi[];
}

export interface RequirementGathererAgentConfig {
  /** User input: project name, goal, features or natural language requirement */
  input: string;
  /** Model config; optional */
  model?: ModelConfig;
  /** Max iterations; default 15 */
  maxIterations?: number;
  /** Callback for each step */
  onStep?: (step: AgentStep) => void;
}
