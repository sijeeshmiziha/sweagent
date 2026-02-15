/**
 * frontend-architect tools
 */

import type { Model } from '../../../lib/types/model';
import { createToolSet } from '../../../lib/tools';
import { validateFrontendTool } from './validate-frontend';
import { createDesignFrontendTool } from './design-frontend';

export { validateFrontendTool } from './validate-frontend';
export { createDesignFrontendTool } from './design-frontend';

/**
 * Create all frontend-architect tools. Pass the model for AI-backed tools.
 */
export function createFrontendArchitectTools(model: Model) {
  return createToolSet({
    validate_frontend: validateFrontendTool,
    design_frontend: createDesignFrontendTool(model),
  });
}
