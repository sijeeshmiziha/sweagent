/**
 * data-modeler module - enterprise data modeling for MongoDB and PostgreSQL
 * Exports use 'dm' prefix to avoid conflicts with db-designer and requirement-gatherer.
 */

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
