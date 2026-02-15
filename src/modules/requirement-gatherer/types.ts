/**
 * requirement-gatherer module types
 * Chat-based 4-stage flow: discovery -> requirements -> design -> complete
 */

import type { AgentStep } from '../../lib/types/agent';
import type { Logger } from '../../lib/types/common';
import type { ModelConfig } from '../../lib/types/model';
import type { Model } from '../../lib/types/model';

/** Stage in the requirement gathering flow */
export type Stage = 'discovery' | 'requirements' | 'design' | 'complete';

/** Project brief from discovery (name, goal, api style, backend runtime) */
export interface ProjectBrief {
  name: string;
  goal: string;
  features: string[];
  domain: string;
  database: 'mongodb' | 'postgresql';
  backendRuntime: 'nodejs';
  apiStyle: 'rest' | 'graphql';
}

/** Clarifying question for the user */
export interface Question {
  id: string;
  question: string;
  context: string;
  suggestions: string[];
  multiSelect: boolean;
  required: boolean;
}

/** Single chat message entry */
export interface ChatEntry {
  role: 'user' | 'assistant';
  content: string;
}

/** Actor (user type) from requirements stage */
export interface Actor {
  id: string;
  name: string;
  description: string;
  goals: string[];
}

/** Flow (user journey) from requirements stage */
export interface Flow {
  id: string;
  actorId: string;
  name: string;
  description: string;
  trigger: string;
  outcome: string;
}

/** User story with data involved */
export interface Story {
  id: string;
  flowId: string;
  actor: string;
  action: string;
  benefit: string;
  preconditions: string[];
  postconditions: string[];
  dataInvolved: string[];
}

/** Module with CRUD APIs from requirements stage */
export interface CrudApi {
  id: string;
  name: string;
  operation: 'create' | 'read' | 'readAll' | 'update' | 'delete';
  description: string;
  inputs: string[];
  outputs: string[];
}

export interface Module {
  id: string;
  name: string;
  description: string;
  entity: string;
  apis: CrudApi[];
}

/** Database design: MongoDB or PostgreSQL with entities */
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
  description: string;
}

export interface DatabaseEntity {
  name: string;
  description: string;
  fields: EntityField[];
  indexes: EntityIndex[];
  relations: EntityRelation[];
}

export interface DatabaseDesign {
  type: 'mongodb' | 'postgresql';
  reasoning: string;
  entities: DatabaseEntity[];
}

/** Summary for final requirement document */
export interface RequirementSummary {
  totalActors: number;
  totalFlows: number;
  totalStories: number;
  totalModules: number;
  totalEntities: number;
  overview: string;
}

/** Final requirement document output */
export interface FinalRequirement {
  project: ProjectBrief;
  actors: Actor[];
  flows: Flow[];
  stories: Story[];
  modules: Module[];
  database: DatabaseDesign;
  summary: RequirementSummary;
}

/** Accumulated context across chat turns */
export interface RequirementContext {
  stage: Stage;
  projectBrief: ProjectBrief | null;
  actors: Actor[];
  flows: Flow[];
  stories: Story[];
  modules: Module[];
  database: DatabaseDesign | null;
  history: ChatEntry[];
  pendingQuestions: Question[];
}

/** Result of a single chat turn */
export interface ChatTurnResult {
  message: string;
  context: RequirementContext;
  questions: Question[];
  finalRequirement: FinalRequirement | null;
}

/** Config for processRequirementChat */
export interface RequirementChatConfig {
  model?: ModelConfig;
  maxIterations?: number;
  onStep?: (step: AgentStep) => void;
  logger?: Logger;
}

/** Result of a stage processor */
export interface StageResult {
  message: string;
  questions?: Question[];
  advance: boolean;
  data: Partial<RequirementContext> & { finalRequirement?: FinalRequirement };
}

/** Stage processor function type */
export type StageProcessor = (
  userMessage: string,
  context: RequirementContext,
  model: Model
) => Promise<StageResult>;

/** Legacy alias for Module (backward compatibility) */
export type ExtractedModule = Module;

/** Legacy: minimal project info (backward compatibility) */
export interface BasicProjectInfo {
  name: string;
  goal: string;
  features: string;
}

/** Legacy: runRequirementGathererAgent config (one-shot wrapper) */
export interface RequirementGathererAgentConfig {
  input: string;
  model?: ModelConfig;
  maxIterations?: number;
  onStep?: (step: AgentStep) => void;
  logger?: Logger;
}
