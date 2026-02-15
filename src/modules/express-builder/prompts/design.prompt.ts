/**
 * Design prompt for Express config generation
 */

export const DESIGN_EXPRESS_PROMPT = `## Requirements:
{requirement}

Generate an Express.js application configuration. Include:

1. Controllers: one per resource with RESTful methods (GET, POST, PUT, DELETE).
2. Models: Mongoose models with fields, types, required, unique, refs, defaults, indexes.
3. Middleware: auth (JWT), validation (Zod), error handler, CORS, rate limiting, logging.
4. Env vars: PORT, DATABASE_URL, JWT_SECRET, etc.
5. Folder structure: src/controllers/, src/models/, src/middleware/, src/routes/, src/config/.

Return ONLY valid JSON:
{
  "appName": "my-api",
  "port": 3000,
  "database": "mongodb",
  "controllers": [{
    "name": "UserController",
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
  "envVars": ["PORT", "DATABASE_URL", "JWT_SECRET"],
  "folderStructure": ["src/", "src/controllers/", "src/models/", "src/middleware/", "src/routes/", "src/config/"]
}`;

export function buildDesignExpressPrompt(requirement: string): string {
  return DESIGN_EXPRESS_PROMPT.replace('{requirement}', requirement);
}
