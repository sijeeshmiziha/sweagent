/**
 * db-designer module types - structured requirements and agent config
 */

import type { AgentStep } from '../../lib/types/agent';
import type { Logger } from '../../lib/types/common';
import type { ModelConfig } from '../../lib/types/model';

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

export interface TechnicalRequirements {
  authentication: 'none' | 'email' | 'oauth' | 'phone' | 'email_and_phone';
  authorization: boolean;
  roles?: string[];
  integrations?: string[];
  realtime?: boolean;
  fileUpload?: boolean;
  search?: boolean;
}

export interface StructuredRequirementsInput {
  projectName: string;
  projectGoal: string;
  projectDescription?: string;
  actors: Actor[];
  flows: ExtractedFlow[];
  stories: ExtractedStory[];
  technicalRequirements?: TechnicalRequirements;
}

export interface DbDesignerAgentConfig {
  /** User input: natural language requirement or instruction */
  input: string;
  /** Model config; optional, caller can pass via runAgent */
  model?: ModelConfig;
  /** Max iterations; default 15 */
  maxIterations?: number;
  /** Callback for each step */
  onStep?: (step: AgentStep) => void;
  /** Optional logger for execution logs */
  logger?: Logger;
}
