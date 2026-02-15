/**
 * backend-architect tools
 */

import type { Model } from '../../../lib/types/model';
import { createToolSet } from '../../../lib/tools';
import { validateBackendTool } from './validate-backend';
import { createDesignBackendTool } from './design-backend';

export { validateBackendTool } from './validate-backend';
export { createDesignBackendTool } from './design-backend';

/**
 * Create all backend-architect tools. Pass the model for AI-backed tools.
 */
export function createBackendArchitectTools(model: Model) {
  return createToolSet({
    validate_backend: validateBackendTool,
    design_backend: createDesignBackendTool(model),
  });
}
