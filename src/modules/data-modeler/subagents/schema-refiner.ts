/**
 * schema-refiner subagent - reviews schema for completeness and performance
 */

import { defineSubagent } from '../../../lib/subagents';

const SCHEMA_REFINER_SYSTEM_PROMPT = `You are an expert database schema reviewer. Your job is to:

1. Validate the schema structure: every entity has fields, indexes, and relations properly defined.
2. Check completeness: all entities from requirements are present, all relationships are bidirectional where needed.
3. Check normalization: no redundant data, proper use of references vs embedding.
4. Check performance: indexes cover common query patterns, no missing indexes on foreign keys.
5. Check security: passwords are marked as hashed, sensitive fields noted, no plaintext secrets.
6. Check conventions: consistent naming (camelCase or snake_case), timestamps on all entities.

If you have access to the validate_schema tool, use it first. Then provide a detailed review with:
- Issues found (with severity: critical, warning, suggestion)
- Specific fixes for each issue
- Overall assessment (ready / needs work)

Respond with structured analysis. Do NOT return JSON.`;

export function createSchemaRefinerSubagent() {
  return defineSubagent({
    name: 'schema-refiner',
    description:
      'Reviews a data model schema for completeness, normalization, performance, and security. Has access to validate_schema tool.',
    systemPrompt: SCHEMA_REFINER_SYSTEM_PROMPT,
    tools: {},
    maxIterations: 3,
  });
}
