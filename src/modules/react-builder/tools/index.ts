/**
 * react-builder tools
 */

import type { Model } from '../../../lib/types/model';
import { createToolSet } from '../../../lib/tools';
import { validateFrontendConfigTool } from './validate-frontend-config.tool';
import { createGenerateFrontendTool } from './generate-frontend.tool';
import { createGenerateFeatureBreakdownTool } from './generate-feature-breakdown.tool';

export { validateFrontendConfigTool } from './validate-frontend-config.tool';
export { createGenerateFrontendTool } from './generate-frontend.tool';
export {
  createGenerateFeatureBreakdownTool,
  type FeatureBreakdownResult,
} from './generate-feature-breakdown.tool';

export function createReactBuilderTools(model: Model) {
  return createToolSet({
    validate_frontend_config: validateFrontendConfigTool,
    generate_frontend: createGenerateFrontendTool(model),
    generate_feature_breakdown: createGenerateFeatureBreakdownTool(model),
  });
}
