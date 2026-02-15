/**
 * data-modeler tools
 */

import type { Model } from '../../../lib/types/model';
import { createToolSet } from '../../../lib/tools';
import { validateSchemaTool } from './validate-schema';
import { createDesignSchemaTool } from './design-schema';
import { createDesignSchemaProTool } from './design-schema-pro';
import { createRefineSchemaTools } from './refine-schema';

export { validateSchemaTool } from './validate-schema';
export { createDesignSchemaTool } from './design-schema';
export { createDesignSchemaProTool } from './design-schema-pro';
export { createRefineSchemaTools } from './refine-schema';

/**
 * Create all data-modeler tools. Pass the model for AI-backed tools.
 */
export function createDataModelerTools(model: Model) {
  return createToolSet({
    validate_data_model: validateSchemaTool,
    design_schema: createDesignSchemaTool(model),
    design_schema_pro: createDesignSchemaProTool(model),
    refine_schema: createRefineSchemaTools(model),
  });
}
