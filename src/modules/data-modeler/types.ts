/**
 * data-modeler module types
 */

import type { AgentStep } from '../../lib/types/agent';
import type { Logger } from '../../lib/types/common';
import type { ModelConfig } from '../../lib/types/model';

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
