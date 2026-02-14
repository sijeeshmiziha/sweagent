/**
 * requirement-gatherer schemas - Zod schemas for structured outputs
 */

export {
  projectBriefSchema,
  questionSchema,
  chatEntrySchema,
  requirementContextSchema,
  type ProjectBrief,
  type Question,
  type ChatEntry,
  type RequirementContext,
} from './context.schema';
export {
  entityFieldSchema,
  entityIndexSchema,
  entityRelationSchema,
  databaseEntitySchema,
  databaseDesignSchema,
  type EntityField,
  type EntityIndex,
  type EntityRelation,
  type DatabaseEntity,
  type DatabaseDesign,
} from './database.schema';
export {
  restEndpointSchema,
  restApiDesignSchema,
  graphqlTypeDefinitionSchema,
  graphqlOperationSchema,
  graphqlApiDesignSchema,
  apiDesignSchema,
  type RestEndpoint,
  type RestApiDesign,
  type GraphqlTypeDefinition,
  type GraphqlOperation,
  type GraphqlApiDesign,
  type ApiDesign,
} from './api-design.schema';
export {
  requirementSummarySchema,
  finalRequirementSchema,
  type RequirementSummary,
  type FinalRequirement,
} from './requirement.schema';
export { actorSchema, actorsResultSchema, type ActorResult } from './actor.schema';
export { flowSchema, flowsResultSchema, type FlowsResult } from './flow.schema';
export { storySchema, storiesResultSchema, type StoriesResult } from './story.schema';
export {
  crudApiSchema,
  extractedModuleSchema,
  modulesResultSchema,
  type ModulesResult,
} from './module.schema';
