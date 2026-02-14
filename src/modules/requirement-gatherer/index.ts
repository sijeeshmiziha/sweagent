/**
 * requirement-gatherer module - requirements pipeline (InfoProcessing, UsersFinding, Flows, Stories, Modules)
 * Note: Actor, ExtractedFlow, ExtractedStory are not re-exported to avoid conflict with db-designer (same shapes).
 */

export * from './schemas';
export type {
  BasicProjectInfo,
  ExtractedModule,
  CrudApi,
  Module,
  RequirementGathererAgentConfig,
  RequirementChatConfig,
  ChatTurnResult,
  FinalRequirement,
  RequirementContext,
  ProjectBrief,
  Stage,
} from './types';
export * from './prompts';
export { runRequirementGathererAgent } from './agent';
export { processRequirementChat } from './chat';
export { RequirementContextBuilder, createRequirementContextBuilder } from './context-builder';
export { createInitialContext, mergeStageResult, addChatEntry, advanceStage } from './context';
