/**
 * Design prompt for subgraph config generation
 */

export const DESIGN_SUBGRAPH_PROMPT = `## Requirements:
{requirement}

Generate an Apollo GraphQL subgraph configuration. Include:

1. Modules: one per entity. Each has types, operations (queries/mutations), and datasource name.
2. Types: GraphQL object types, input types, enums with fields/values.
3. Operations: queries (getById, getAll, search) and mutations (create, update, delete) per module.
4. Auth: mark which operations require authentication and which roles.
5. Shared types: types used across modules (e.g. Pagination, SortOrder).
6. Env vars: PORT, DATABASE_URL, JWT_SECRET, etc.

Return ONLY valid JSON:
{
  "appName": "my-subgraph",
  "port": 4000,
  "database": "mongodb",
  "modules": [{
    "name": "user",
    "entity": "User",
    "types": [{ "name": "User", "kind": "type", "fields": [{ "name": "id", "type": "ID", "nullable": false }] }],
    "operations": [{ "name": "getUser", "type": "query", "args": [{ "name": "id", "type": "ID", "nullable": false }], "returnType": "User", "auth": true, "roles": [] }],
    "datasource": "UserDataSource"
  }],
  "sharedTypes": [],
  "authDirective": true,
  "envVars": ["PORT", "DATABASE_URL", "JWT_SECRET"]
}`;

export function buildDesignSubgraphPrompt(requirement: string): string {
  return DESIGN_SUBGRAPH_PROMPT.replace('{requirement}', requirement);
}
