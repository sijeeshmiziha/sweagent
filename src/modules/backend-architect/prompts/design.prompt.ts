/**
 * Design prompt for backend architecture generation
 */

export const DESIGN_BACKEND_PROMPT = `## Requirements:
{requirement}

Design the backend architecture. Include:

1. Framework: choose "express" (REST API), "apollo" (GraphQL subgraph), or "both" (Apollo subgraph + Express gateway).
2. Services: one per entity with CRUD operations and dependencies.
3. Middleware: auth (JWT/session), validation (Zod/Joi), error handling, CORS, rate limiting.
4. Routes (if Express): RESTful routes grouped by resource with method, path, handler, auth, and roles.
5. Folder structure: list of directories and key files.
6. Env vars: list all required environment variables.

Return ONLY valid JSON:
{
  "framework": "express" | "apollo" | "both",
  "language": "typescript",
  "database": "mongodb",
  "services": [{ "name": "UserService", "entity": "User", "operations": ["create", "findById", "findAll", "update", "delete"], "dependencies": [] }],
  "middleware": [{ "name": "authMiddleware", "purpose": "JWT token verification", "appliesTo": "global", "config": {} }],
  "routes": [{ "resource": "users", "basePath": "/api/users", "endpoints": [{ "method": "GET", "path": "/", "handler": "getAll", "auth": true, "roles": ["admin"] }] }],
  "folderStructure": ["src/", "src/routes/", "src/services/", "src/middleware/", "src/models/", "src/config/"],
  "envVars": ["PORT", "DATABASE_URL", "JWT_SECRET"],
  "notes": ""
}`;

export function buildDesignBackendPrompt(requirement: string): string {
  return DESIGN_BACKEND_PROMPT.replace('{requirement}', requirement);
}
