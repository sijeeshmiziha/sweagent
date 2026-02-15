/**
 * validate_schema tool - validates JSON against mongoProjectSchema (merged from db-designer)
 */

import { createValidationTool } from '../../../lib/tools';
import { mongoProjectSchema } from '../schemas';

export const validateMongoSchemaTool = createValidationTool(
  'validate_schema',
  mongoProjectSchema,
  'Validates a MongoDB project schema JSON string against the expected schema. Returns valid: true or valid: false with errors.',
  'schema'
);
