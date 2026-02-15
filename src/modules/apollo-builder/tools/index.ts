/**
 * apollo-builder tools
 */

import type { Model } from '../../../lib/types/model';
import { createToolSet } from '../../../lib/tools';
import { validateSubgraphTool } from './validate-subgraph';
import { createGenerateSubgraphTool } from './generate-subgraph';
import { scaffoldSubgraphTool } from './scaffold-subgraph';

export { validateSubgraphTool } from './validate-subgraph';
export { createGenerateSubgraphTool } from './generate-subgraph';
export { scaffoldSubgraphTool } from './scaffold-subgraph';

/**
 * Create all apollo-builder tools. Pass the model for AI-backed tools.
 */
export function createApolloBuilderTools(model: Model) {
  return createToolSet({
    validate_subgraph: validateSubgraphTool,
    generate_subgraph: createGenerateSubgraphTool(model),
    scaffold_subgraph: scaffoldSubgraphTool,
  });
}
