/**
 * data-modeler tools (generic + MongoDB)
 */

import type { Model } from '../../../lib/types/model';
import { createToolSet } from '../../../lib/tools';
import { validateSchemaTool } from './validate-schema';
import { createDesignSchemaTool } from './design-schema';
import { createDesignSchemaProTool } from './design-schema-pro';
import { createRefineSchemaTools } from './refine-schema';
import { validateMongoSchemaTool } from './validate-mongodb';
import { createDesignDatabaseTool } from './design-mongodb';
import { createDesignDatabaseProTool } from './design-mongodb-pro';
import { createRedesignDatabaseTool } from './redesign-mongodb';

export { validateSchemaTool } from './validate-schema';
export { createDesignSchemaTool } from './design-schema';
export { createDesignSchemaProTool } from './design-schema-pro';
export { createRefineSchemaTools } from './refine-schema';

/* MongoDB-specific tools (merged from db-designer) */
export { validateMongoSchemaTool } from './validate-mongodb';
export { createDesignDatabaseTool } from './design-mongodb';
export { createDesignDatabaseProTool } from './design-mongodb-pro';
export { createRedesignDatabaseTool } from './redesign-mongodb';

/**
 * Create all generic data-modeler tools. Pass the model for AI-backed tools.
 */
export function createDataModelerTools(model: Model) {
  return createToolSet({
    validate_data_model: validateSchemaTool,
    design_schema: createDesignSchemaTool(model),
    design_schema_pro: createDesignSchemaProTool(model),
    refine_schema: createRefineSchemaTools(model),
  });
}

/**
 * Create all MongoDB-specific tools (merged from db-designer).
 */
export function createDbDesignerTools(model: Model) {
  return createToolSet({
    validate_schema: validateMongoSchemaTool,
    design_database: createDesignDatabaseTool(model),
    design_database_pro: createDesignDatabaseProTool(model),
    redesign_database: createRedesignDatabaseTool(model),
  });
}
