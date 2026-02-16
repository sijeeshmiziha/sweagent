/**
 * data-modeler module - enterprise data modeling for MongoDB and PostgreSQL
 * Includes merged db-designer module for MongoDB-specific RBAC schema design.
 * Generic exports use 'dm' prefix to avoid conflicts.
 */

/* ── Generic data-modeler exports ────────────────────────── */

export {
  dataModelDesignSchema as dmDataModelDesignSchema,
  dataEntitySchema as dmDataEntitySchema,
  type TDataModelDesign,
} from './schemas';
export type {
  DatabaseType,
  EntityField as DmEntityField,
  EntityIndex as DmEntityIndex,
  EntityRelation as DmEntityRelation,
  DataEntity,
  DataModelDesign,
  DataModelerAgentConfig,
} from './types';
export { DATA_MODELER_SYSTEM_PROMPT } from './prompts';
export {
  validateSchemaTool as dmValidateSchemaTool,
  createDesignSchemaTool,
  createDesignSchemaProTool,
  createRefineSchemaTools,
  createDataModelerTools,
} from './tools';
export {
  entityAnalyzerSubagent as dmEntityAnalyzerSubagent,
  relationshipMapperSubagent,
  createSchemaRefinerSubagent as dmCreateSchemaRefinerSubagent,
} from './subagents';
export { runDataModelerAgent } from './agent';

/* ── MongoDB / db-designer exports (merged) ──────────────── */

export {
  mongoFieldSchema,
  type TMongoFieldSchema,
  mongoModuleSchema,
  type TMongoModuleSchema,
  mongoProjectSchema,
  type TMongoProjectSchema,
} from './schemas';
/** @deprecated Use mongoFieldSchema */
export { mongoFieldSchema as fieldSchema } from './schemas';
/** @deprecated Use mongoModuleSchema */
export { mongoModuleSchema as moduleSchema } from './schemas';
/** @deprecated Use mongoProjectSchema */
export { mongoProjectSchema as projectSchema } from './schemas';
/** @deprecated Use TMongoProjectSchema */
export type { TMongoProjectSchema as TBackendProjectSchema } from './schemas';

export type {
  MongoActor,
  MongoExtractedFlow,
  MongoExtractedStory,
  MongoTechnicalRequirements,
  MongoStructuredInput,
  MongoDbDesignerAgentConfig,
} from './types';
/** @deprecated Use MongoDbDesignerAgentConfig */
export type { MongoDbDesignerAgentConfig as DbDesignerAgentConfig } from './types';

export {
  MONGODB_SYSTEM_PROMPT,
  DB_DESIGN_SYSTEM_PROMPT,
  createMongoDesignPrompt,
  createMongoProDesignPrompt,
  createMongoRedesignPrompt,
  formatUserTypes,
  formatUserFlows,
  formatUserStories,
  formatTechnicalRequirements,
  extractDataEntities,
  extractRoles,
  buildPromptVariables,
} from './prompts';
/** @deprecated Use createMongoDesignPrompt */
export { createMongoDesignPrompt as createDbDesignPrompt } from './prompts';
/** @deprecated Use createMongoProDesignPrompt */
export { createMongoProDesignPrompt as createProDbDesignPrompt } from './prompts';
/** @deprecated Use createMongoRedesignPrompt */
export { createMongoRedesignPrompt as createRedesignPrompt } from './prompts';

export {
  validateMongoSchemaTool as validateSchemaTool,
  createDesignDatabaseTool,
  createDesignDatabaseProTool,
  createRedesignDatabaseTool,
  createDbDesignerTools,
} from './tools';

export { entityAnalyzerSubagent, createSchemaRefinerSubagent } from './subagents';

export { runDbDesignerAgent } from './mongodb-agent';
