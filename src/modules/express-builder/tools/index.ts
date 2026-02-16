/**
 * express-builder tools
 */

import type { Model } from '../../../lib/types/model';
import type { ToolSet } from '../../../lib/tools';
import { createToolSet } from '../../../lib/tools';
import { validateExpressTool } from './validate-express';
import { createGenerateExpressTool } from './generate-express';
import { scaffoldExpressTool } from './scaffold-express';

export { validateExpressTool } from './validate-express';
export { createGenerateExpressTool } from './generate-express';
export { scaffoldExpressTool } from './scaffold-express';

export interface ExpressBuilderToolsOptions {
  /** When true, exclude scaffold tools that write files to disk */
  disableScaffold?: boolean;
}

/**
 * Create all express-builder tools. Pass the model for AI-backed tools.
 */
export function createExpressBuilderTools(model: Model, options?: ExpressBuilderToolsOptions) {
  const tools: ToolSet = {
    validate_express: validateExpressTool,
    generate_express: createGenerateExpressTool(model),
  };
  if (!options?.disableScaffold) {
    tools.scaffold_express = scaffoldExpressTool;
  }
  return createToolSet(tools);
}
