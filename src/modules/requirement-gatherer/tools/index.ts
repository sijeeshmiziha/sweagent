/**
 * requirement-gatherer tools
 */

import type { Model } from '../../../lib/types/model';
import { createToolSet } from '../../../lib/tools';
import { createAnalyzeProjectInfoTool } from './analyze-project-info.tool';
import { createExtractActorsTool } from './extract-actors.tool';
import { createGenerateFlowsTool } from './generate-flows.tool';
import { createGenerateStoriesTool } from './generate-stories.tool';
import { createExtractModulesTool } from './extract-modules.tool';

export { createAnalyzeProjectInfoTool } from './analyze-project-info.tool';
export { createExtractActorsTool } from './extract-actors.tool';
export { createGenerateFlowsTool } from './generate-flows.tool';
export { createGenerateStoriesTool } from './generate-stories.tool';
export { createExtractModulesTool } from './extract-modules.tool';

export function createRequirementGathererTools(model: Model) {
  return createToolSet({
    analyze_project_info: createAnalyzeProjectInfoTool(model),
    extract_actors: createExtractActorsTool(model),
    generate_flows: createGenerateFlowsTool(model),
    generate_stories: createGenerateStoriesTool(model),
    extract_modules: createExtractModulesTool(model),
  });
}
