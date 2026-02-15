/**
 * Design prompts for data-modeler
 */

export const DESIGN_SCHEMA_PROMPT = `## Requirements:
{requirement}

Design the database schema. Determine the best database type (mongodb or postgresql) based on the requirements, or use the one specified.

For MongoDB use types: ObjectId, string, number, boolean, date, array, mixed.
For PostgreSQL use types: uuid, varchar(n), text, integer, bigint, boolean, timestamp, jsonb, and proper foreign key relations.

Return ONLY valid JSON:
{
  "type": "mongodb" | "postgresql",
  "reasoning": "2-4 sentences explaining the choice and design approach",
  "entities": [
    {
      "name": "EntityName",
      "description": "Brief description",
      "fields": [
        { "name": "fieldName", "type": "DB-native type", "required": true, "unique": false, "description": "..." }
      ],
      "indexes": [ { "name": "idx_name", "fields": ["field1"], "unique": false } ],
      "relations": [ { "field": "refField", "references": "OtherEntity", "type": "1:N", "description": "..." } ]
    }
  ]
}`;

export const REFINE_SCHEMA_PROMPT = `## Current Schema (JSON):
{existingSchema}

## Feedback:
{feedback}

Update the schema based on the feedback. Return the complete updated schema as valid JSON in the same format.`;

export function buildDesignSchemaPrompt(requirement: string): string {
  return DESIGN_SCHEMA_PROMPT.replace('{requirement}', requirement);
}

export function buildRefineSchemaPrompt(existingSchema: string, feedback: string): string {
  return REFINE_SCHEMA_PROMPT.replace('{existingSchema}', existingSchema).replace(
    '{feedback}',
    feedback
  );
}
