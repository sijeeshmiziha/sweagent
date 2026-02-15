/**
 * data-modeler module types (generic + MongoDB-specific, merged from db-designer)
 */

import type { AgentStep } from '../../lib/types/agent';
import type { Logger } from '../../lib/types/common';
import type { ModelConfig } from '../../lib/types/model';

/* ── Generic data-modeler types ─────────────────────────── */

export type DatabaseType = 'mongodb' | 'postgresql';

export interface EntityField {
  name: string;
  type: string;
  required: boolean;
  unique: boolean;
  description: string;
  default?: string;
}

export interface EntityIndex {
  name: string;
  fields: string[];
  unique: boolean;
}

export interface EntityRelation {
  field: string;
  references: string;
  type: '1:1' | '1:N' | 'M:N';
  description: string;
}

export interface DataEntity {
  name: string;
  description: string;
  fields: EntityField[];
  indexes: EntityIndex[];
  relations: EntityRelation[];
}

export interface DataModelDesign {
  type: DatabaseType;
  reasoning: string;
  entities: DataEntity[];
}

export interface DataModelerAgentConfig {
  /** User input: natural language description of data modeling needs */
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

/* ── MongoDB-specific types (merged from db-designer) ──── */

export interface MongoActor {
  id: string;
  name: string;
  description: string;
  goals: string[];
}

export interface MongoExtractedFlow {
  id: string;
  actorId: string;
  name: string;
  description: string;
  trigger: string;
  outcome: string;
}

export interface MongoExtractedStory {
  id: string;
  flowId: string;
  actor: string;
  action: string;
  benefit: string;
  preconditions: string[];
  postconditions: string[];
  dataInvolved: string[];
}

export interface MongoTechnicalRequirements {
  authentication: 'none' | 'email' | 'oauth' | 'phone' | 'email_and_phone';
  authorization: boolean;
  roles?: string[];
  integrations?: string[];
  realtime?: boolean;
  fileUpload?: boolean;
  search?: boolean;
}

export interface MongoStructuredInput {
  projectName: string;
  projectGoal: string;
  projectDescription?: string;
  actors: MongoActor[];
  flows: MongoExtractedFlow[];
  stories: MongoExtractedStory[];
  technicalRequirements?: MongoTechnicalRequirements;
}

/** @deprecated Use MongoDbDesignerAgentConfig */
export type DbDesignerAgentConfig = MongoDbDesignerAgentConfig;

export interface MongoDbDesignerAgentConfig {
  /** User input: natural language requirement or instruction */
  input: string;
  /** Model config; optional */
  model?: ModelConfig;
  /** Max iterations; default 15 */
  maxIterations?: number;
  /** Callback for each step */
  onStep?: (step: AgentStep) => void;
  /** Optional logger */
  logger?: Logger;
}
