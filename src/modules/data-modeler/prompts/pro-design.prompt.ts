/**
 * Pro-level 5-phase data modeling prompt
 */

export const PRO_DESIGN_PROMPT = `## Project: {projectName}
## Goal: {projectGoal}
## Database: {databaseType}

## Context:
{context}

Apply the 5-phase enterprise data modeling process:

### Phase 1: Entity Discovery
- Extract every entity from the context (user types, domain objects, settings, logs).
- Identify status enums from flow transitions.

### Phase 2: Relationship Mapping
- For each entity pair, determine ownership and cardinality (1:1, 1:N, M:N).
- Note bidirectional references and join tables (PostgreSQL) or embedded arrays (MongoDB).

### Phase 3: Permission Derivation
- Map actor types to role names.
- From actions, derive which role can CRUD which entity.

### Phase 4: Schema Generation
- Generate fields with DB-native types, required/unique flags, defaults.
- Add indexes for common queries (user lookups, date ranges, foreign keys).
- Include timestamps (createdAt, updatedAt) on all entities.

### Phase 5: Validation
- Verify every entity referenced in relations exists.
- Verify no orphan fields or missing indexes.

Return ONLY valid JSON in the DataModelDesign format.`;

export function buildProDesignPrompt(
  projectName: string,
  projectGoal: string,
  databaseType: string,
  context: string
): string {
  return PRO_DESIGN_PROMPT.replace('{projectName}', projectName)
    .replace('{projectGoal}', projectGoal)
    .replace('{databaseType}', databaseType)
    .replace('{context}', context);
}
