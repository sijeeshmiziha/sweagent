/**
 * react-builder tools
 */

import type { Model } from '../../../lib/types/model';
import type { ToolSet } from '../../../lib/tools';
import { createToolSet } from '../../../lib/tools';
import { validateFrontendConfigTool } from './validate-frontend-config.tool';
import { createGenerateFrontendTool } from './generate-frontend.tool';
import { createGenerateFeatureBreakdownTool } from './generate-feature-breakdown.tool';
import { scaffoldViteTool } from './scaffold-vite';

export { validateFrontendConfigTool } from './validate-frontend-config.tool';
export { createGenerateFrontendTool } from './generate-frontend.tool';
export {
  createGenerateFeatureBreakdownTool,
  type FeatureBreakdownResult,
} from './generate-feature-breakdown.tool';
export { scaffoldViteTool } from './scaffold-vite';

export interface ReactBuilderToolsOptions {
  /** When true, exclude scaffold tools that write files to disk */
  disableScaffold?: boolean;
}

export function createReactBuilderTools(model: Model, options?: ReactBuilderToolsOptions) {
  const tools: ToolSet = {
    validate_frontend_config: validateFrontendConfigTool,
    generate_frontend: createGenerateFrontendTool(model),
    generate_feature_breakdown: createGenerateFeatureBreakdownTool(model),
  };
  if (!options?.disableScaffold) {
    tools.scaffold_vite = scaffoldViteTool;
  }
  return createToolSet(tools);
}
