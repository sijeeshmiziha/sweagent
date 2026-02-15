/**
 * Design prompt for Express config generation
 */

export const DESIGN_EXPRESS_PROMPT = `## Requirements:
{requirement}

Generate an Express.js application configuration. Include:

1. Routers: one per resource, co-located with controller and test spec. Each router has RESTful methods (GET, POST, PUT, DELETE).
2. Health check: a default /health router is always included.
3. Models: Mongoose models with fields, types, required, unique, refs, defaults, indexes.
4. Middleware: auth (JWT), validation (Zod), error handler, CORS, rate limiting, logging.
5. Env vars: PORT, DATABASE_URL, JWT_SECRET, NODE_ENV, etc.
6. Folder structure: src/routers/{name}/ with {name}.controller.ts, {name}.router.ts, {name}.spec.ts per feature.

Return ONLY valid JSON:
{
  "appName": "my-api",
  "port": 3000,
  "database": "mongodb",
  "routers": [{
    "name": "users",
    "resource": "users",
    "basePath": "/api/users",
    "methods": [{
      "name": "getAll",
      "httpMethod": "GET",
      "path": "/",
      "auth": true,
      "roles": ["admin"],
      "validation": "",
      "description": "Get all users with pagination"
    }]
  }],
  "models": [{
    "name": "User",
    "collection": "users",
    "fields": [{ "name": "email", "type": "String", "required": true, "unique": true }],
    "timestamps": true,
    "indexes": ["email"]
  }],
  "middleware": [{ "name": "authMiddleware", "type": "auth", "config": {} }],
  "envVars": ["PORT", "DATABASE_URL", "JWT_SECRET", "NODE_ENV"]
}`;

export function buildDesignExpressPrompt(requirement: string): string {
  return DESIGN_EXPRESS_PROMPT.replace('{requirement}', requirement);
}
