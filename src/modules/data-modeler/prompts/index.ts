/**
 * data-modeler prompts (generic + MongoDB)
 */

export { DATA_MODELER_SYSTEM_PROMPT } from './system.prompt';
export {
  DESIGN_SCHEMA_PROMPT,
  REFINE_SCHEMA_PROMPT,
  buildDesignSchemaPrompt,
  buildRefineSchemaPrompt,
} from './design.prompt';
export { PRO_DESIGN_PROMPT, buildProDesignPrompt } from './pro-design.prompt';

/* MongoDB-specific prompts (merged from db-designer) */
export { MONGODB_SYSTEM_PROMPT } from './mongodb-system.prompt';
/** @deprecated Use MONGODB_SYSTEM_PROMPT */
export { MONGODB_SYSTEM_PROMPT as DB_DESIGN_SYSTEM_PROMPT } from './mongodb-system.prompt';
export { createMongoDesignPrompt, createMongoProDesignPrompt } from './mongodb-design.prompt';
export { createMongoRedesignPrompt } from './mongodb-redesign.prompt';
export {
  formatUserTypes,
  formatUserFlows,
  formatUserStories,
  formatTechnicalRequirements,
  extractDataEntities,
  extractRoles,
  buildPromptVariables,
} from './mongodb-formatters';
