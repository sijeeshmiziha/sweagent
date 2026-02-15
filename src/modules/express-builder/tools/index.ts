/**
 * express-builder tools
 */

import type { Model } from '../../../lib/types/model';
import { createToolSet } from '../../../lib/tools';
import { validateExpressTool } from './validate-express';
import { createGenerateExpressTool } from './generate-express';
import { scaffoldExpressTool } from './scaffold-express';

export { validateExpressTool } from './validate-express';
export { createGenerateExpressTool } from './generate-express';
export { scaffoldExpressTool } from './scaffold-express';

/**
 * Create all express-builder tools. Pass the model for AI-backed tools.
 */
export function createExpressBuilderTools(model: Model) {
  return createToolSet({
    validate_express: validateExpressTool,
    generate_express: createGenerateExpressTool(model),
    scaffold_express: scaffoldExpressTool,
  });
}
