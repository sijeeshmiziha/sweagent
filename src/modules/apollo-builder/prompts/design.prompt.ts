/**
 * Design prompt for subgraph config generation
 */

export const DESIGN_SUBGRAPH_PROMPT = `## Requirements:
{requirement}

Generate an Apollo GraphQL subgraph configuration (Federation v2). Include:

1. Modules: one per entity with 4 files each ({module}.graphql, {module}.resolver.ts, {module}.datasource.ts, {module}.loader.ts).
2. Types: GraphQL object types with isEntity/keyFields for federation, input types, enums with fields/values.
3. Operations: queries (getById, getAll, search) and mutations (create, update, delete) per module.
4. Auth: mark which operations require authentication and which roles.
5. DataLoader: one loader per module for batching lookups (loader name).
6. Shared types: types used across modules (e.g. Pagination, SortOrder).
7. Cache: set cacheDirective to true if Redis caching (@cacheSet/@cachePurge) is needed.
8. Env vars: PORT, DATABASE_URL, JWT_SECRET, REDIS_URL, etc.

Return ONLY valid JSON:
{
  "appName": "my-subgraph",
  "port": 4000,
  "database": "mongodb",
  "modules": [{
    "name": "user",
    "entity": "User",
    "types": [{ "name": "User", "kind": "type", "fields": [{ "name": "id", "type": "ID", "nullable": false }], "isEntity": true, "keyFields": ["id"] }],
    "operations": [{ "name": "getUser", "type": "query", "args": [{ "name": "id", "type": "ID", "nullable": false }], "returnType": "User", "auth": true, "roles": [] }],
    "datasource": "UserDataSource",
    "loader": "UserLoader"
  }],
  "sharedTypes": [],
  "authDirective": true,
  "cacheDirective": false,
  "envVars": ["PORT", "DATABASE_URL", "JWT_SECRET", "REDIS_URL"]
}`;

export function buildDesignSubgraphPrompt(requirement: string): string {
  return DESIGN_SUBGRAPH_PROMPT.replace('{requirement}', requirement);
}
