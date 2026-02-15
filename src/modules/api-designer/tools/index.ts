/**
 * api-designer tools
 */

import type { Model } from '../../../lib/types/model';
import { createToolSet } from '../../../lib/tools';
import { validateApiTool } from './validate-api';
import { createDesignApiTool } from './design-api';
import { createDesignApiProTool } from './design-api-pro';

export { validateApiTool } from './validate-api';
export { createDesignApiTool } from './design-api';
export { createDesignApiProTool } from './design-api-pro';

/**
 * Create all api-designer tools. Pass the model for AI-backed tools.
 */
export function createApiDesignerTools(model: Model) {
  return createToolSet({
    validate_api: validateApiTool,
    design_api: createDesignApiTool(model),
    design_api_pro: createDesignApiProTool(model),
  });
}
