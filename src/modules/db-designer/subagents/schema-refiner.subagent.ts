/**
 * schema-refiner subagent - validates schema and suggests refinements (has validate_schema tool)
 */

import { defineSubagent } from '../../../lib/subagents';
import { validateSchemaTool } from '../tools/validate-schema.tool';

const SCHEMA_REFINER_SYSTEM_PROMPT = `You are an expert MongoDB schema reviewer. Your job is to:

1. Validate the provided schema using the validate_schema tool.
2. Compare the schema against the original requirements and identify gaps (missing fields, wrong relationships, missing permissions).
3. Suggest concrete improvements or return a corrected schema description.

When the user gives you a schema (as JSON string) and optionally the original requirements, first call validate_schema to check structure. Then analyze completeness and correctness. Respond with either refinement suggestions or a summary of issues.`;

export function createSchemaRefinerSubagent() {
  return defineSubagent({
    name: 'schema-refiner',
    description:
      'Validates a MongoDB project schema and suggests refinements based on requirements. Use when you have a draft schema and want to check it or improve it. Has access to validate_schema tool.',
    systemPrompt: SCHEMA_REFINER_SYSTEM_PROMPT,
    tools: { validate_schema: validateSchemaTool },
    maxIterations: 5,
  });
}
