/**
 * apollo-builder tools
 */

import type { Model } from '../../../lib/types/model';
import type { ToolSet } from '../../../lib/tools';
import { createToolSet } from '../../../lib/tools';
import { validateSubgraphTool } from './validate-subgraph';
import { createGenerateSubgraphTool } from './generate-subgraph';
import { scaffoldSubgraphTool } from './scaffold-subgraph';

export { validateSubgraphTool } from './validate-subgraph';
export { createGenerateSubgraphTool } from './generate-subgraph';
export { scaffoldSubgraphTool } from './scaffold-subgraph';

export interface ApolloBuilderToolsOptions {
  /** When true, exclude scaffold tools that write files to disk */
  disableScaffold?: boolean;
}

/**
 * Create all apollo-builder tools. Pass the model for AI-backed tools.
 */
export function createApolloBuilderTools(model: Model, options?: ApolloBuilderToolsOptions) {
  const tools: ToolSet = {
    validate_subgraph: validateSubgraphTool,
    generate_subgraph: createGenerateSubgraphTool(model),
  };
  if (!options?.disableScaffold) {
    tools.scaffold_subgraph = scaffoldSubgraphTool;
  }
  return createToolSet(tools);
}
