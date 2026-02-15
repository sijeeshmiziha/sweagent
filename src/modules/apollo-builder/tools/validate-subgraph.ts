/**
 * validate_subgraph tool - validates JSON against subgraphConfigSchema (no AI)
 */

import { createValidationTool } from '../../../lib/tools';
import { subgraphConfigSchema } from '../schemas';

export const validateSubgraphTool = createValidationTool(
  'validate_subgraph',
  subgraphConfigSchema,
  'Validates a subgraph config JSON string against the SubgraphConfig schema. Returns valid: true or valid: false with errors.',
  'config'
);
