/**
 * auth-designer tools
 */

import type { Model } from '../../../lib/types/model';
import { createToolSet } from '../../../lib/tools';
import { validateAuthTool } from './validate-auth';
import { createDesignAuthTool } from './design-auth';

export { validateAuthTool } from './validate-auth';
export { createDesignAuthTool } from './design-auth';

/**
 * Create all auth-designer tools. Pass the model for AI-backed tools.
 */
export function createAuthDesignerTools(model: Model) {
  return createToolSet({
    validate_auth: validateAuthTool,
    design_auth: createDesignAuthTool(model),
  });
}
