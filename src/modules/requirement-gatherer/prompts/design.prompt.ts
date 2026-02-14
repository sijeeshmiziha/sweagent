/**
 * Design stage prompts - direct LLM invocation for database and API design
 */

const DESIGN_DB_PROMPT = `You are a database architect. The project brief includes a "database" field (mongodb or postgresql)—use that database. Do not choose a different one. Output a single JSON object.

## Project brief (includes database: "mongodb" | "postgresql"):
{projectBrief}

## Modules (entities and CRUD):
{modules}

## User stories (data involved):
{stories}

Design the schema for the chosen database. For MongoDB use types like ObjectId, string, number, date, array; for PostgreSQL use varchar(n), text, integer, uuid, timestamp, jsonb, and proper foreign key relations.

Return ONLY valid JSON (no markdown) in this exact shape. Set "type" to the database from the project brief.
{
  "type": "mongodb" | "postgresql",
  "reasoning": "2-4 sentences on how the schema fits the project",
  "entities": [
    {
      "name": "EntityName",
      "description": "Brief description",
      "fields": [
        { "name": "fieldName", "type": "DB-native type", "required": true, "unique": false, "description": "..." }
      ],
      "indexes": [ { "name": "index_name", "fields": ["field1"], "unique": false } ],
      "relations": [ { "field": "refField", "references": "OtherEntity", "description": "..." } ]
    }
  ]
}`;

const DESIGN_APIS_PROMPT = `You are an API architect for Node.js backends. Design the API according to apiStyle in the project brief.

## Project brief (includes apiStyle: "rest" | "graphql"):
{projectBrief}

## Modules:
{modules}

## Actors:
{actors}

## Stories:
{stories}

## Database design (entities and fields):
{database}

Produce an API design:
- If apiStyle is "rest": include "rest" with baseUrl (e.g. "/api/v1") and endpoints array. Each endpoint: id, moduleId, method (exactly one of GET, POST, PUT, PATCH, DELETE), path, description, auth (boolean), roles (array of strings), requestBody/responseBody/queryParams (flat object of string keys to string values, or {}). responseBody must always be a flat object, never an array—even for list endpoints use a single object describing the shape (e.g. for GET /users use "responseBody": { "items": "array of user objects", "total": "number" }).
- If apiStyle is "graphql": include "graphql" with types (kind: "type" | "input" | "enum", fields array), queries, mutations. Each operation: name, moduleId, description, auth (boolean), roles (array), args (name, type, required boolean), returnType.

Return ONLY valid JSON (no markdown, no code fences). Required shape:
{
  "style": "rest" or "graphql",
  "rest": { "baseUrl": "/api/v1", "endpoints": [ { "id": "ep-1", "moduleId": "module-1", "method": "GET", "path": "/users", "description": "List users", "auth": true, "roles": [], "requestBody": {}, "responseBody": { "items": "array of user objects", "total": "number" }, "queryParams": {} } ] },
  "graphql": { "types": [], "queries": [], "mutations": [] }
}
- Use lowercase "rest" or "graphql" for style. Omit the branch not used (omit "graphql" when style is "rest", omit "rest" when style is "graphql").`;

export const DESIGN_DATABASE_SYSTEM_PROMPT =
  'You output only valid JSON. No markdown, no explanation.';

export const DESIGN_APIS_SYSTEM_PROMPT = 'You output only valid JSON. No markdown, no explanation.';

export function buildDesignDatabasePrompt(
  projectBrief: string,
  modules: string,
  stories: string
): string {
  return DESIGN_DB_PROMPT.replace('{projectBrief}', projectBrief)
    .replace('{modules}', modules)
    .replace('{stories}', stories);
}

export function buildDesignApisPrompt(
  projectBrief: string,
  modules: string,
  actors: string,
  stories: string,
  database: string
): string {
  return DESIGN_APIS_PROMPT.replace('{projectBrief}', projectBrief)
    .replace('{modules}', modules)
    .replace('{actors}', actors)
    .replace('{stories}', stories)
    .replace('{database}', database);
}
