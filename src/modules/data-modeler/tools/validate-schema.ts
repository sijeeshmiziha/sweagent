/**
 * validate_schema tool - validates JSON against dataModelDesignSchema (no AI)
 */

import { createValidationTool } from '../../../lib/tools';
import { dataModelDesignSchema } from '../schemas';

export const validateSchemaTool = createValidationTool(
  'validate_data_model',
  dataModelDesignSchema,
  'Validates a data model JSON string against the DataModelDesign schema. Returns valid: true or valid: false with errors.',
  'schema'
);
