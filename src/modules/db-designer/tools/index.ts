/**
 * db-designer tools
 */

import type { Model } from '../../../lib/types/model';
import { createToolSet } from '../../../lib/tools';
import { validateSchemaTool } from './validate-schema.tool';
import { createDesignDatabaseTool } from './design-database.tool';
import { createDesignDatabaseProTool } from './design-database-pro.tool';
import { createRedesignDatabaseTool } from './redesign-database.tool';

export { validateSchemaTool } from './validate-schema.tool';
export { createDesignDatabaseTool } from './design-database.tool';
export { createDesignDatabaseProTool } from './design-database-pro.tool';
export { createRedesignDatabaseTool } from './redesign-database.tool';

/**
 * Create all db-designer tools for the agent. Pass the model for AI-backed tools.
 */
export function createDbDesignerTools(model: Model) {
  return createToolSet({
    validate_schema: validateSchemaTool,
    design_database: createDesignDatabaseTool(model),
    design_database_pro: createDesignDatabaseProTool(model),
    redesign_database: createRedesignDatabaseTool(model),
  });
}
