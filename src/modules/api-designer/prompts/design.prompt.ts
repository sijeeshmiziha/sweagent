/**
 * Design prompts for api-designer
 */

export const DESIGN_API_PROMPT = `## Requirements:
{requirement}

Design the API. Determine the best API style ("rest" or "graphql") based on the requirements, or use the one specified.

IMPORTANT: You MUST generate ALL CRUD endpoints (Create, Read, List, Update, Delete) for EVERY resource identified in the requirements. The "endpoints" array MUST NOT be empty for REST APIs.

For REST: group endpoints by resource. Each endpoint needs: id, resource, method, path, description, auth, roles, requestBody, responseBody, queryParams, validation, and errorResponses.
For GraphQL: define operations (queries, mutations, subscriptions) with args and return types.

Return ONLY valid JSON matching this exact structure:
{
  "style": "rest",
  "baseUrl": "/api/v1",
  "endpoints": [
    {
      "id": "ep-1",
      "resource": "users",
      "method": "POST",
      "path": "/api/v1/users",
      "description": "Register a new user",
      "auth": false,
      "roles": [],
      "requestBody": { "name": "string", "email": "string", "password": "string" },
      "responseBody": { "id": "string", "name": "string", "email": "string" },
      "queryParams": {},
      "validation": ["name is required", "email must be valid format"],
      "errorResponses": ["400 Validation error", "409 Email already exists"]
    },
    {
      "id": "ep-2",
      "resource": "users",
      "method": "GET",
      "path": "/api/v1/users/:id",
      "description": "Get user by ID",
      "auth": true,
      "roles": ["user", "admin"],
      "requestBody": {},
      "responseBody": { "id": "string", "name": "string", "email": "string" },
      "queryParams": {},
      "validation": [],
      "errorResponses": ["401 Unauthenticated", "404 User not found"]
    }
  ],
  "graphqlOperations": []
}

Generate endpoints for ALL resources. Do NOT return an empty endpoints array.`;

export const PRO_DESIGN_API_PROMPT = `## Project: {projectName}
## API Style: {apiStyle}
## Data Model:
{dataModel}
## Requirements:
{context}

Design a comprehensive API surface from the data model and requirements. For EVERY entity in the data model, generate CRUD endpoints (Create, Read by ID, List with pagination, Update, Delete) plus any custom operations implied by the requirements.

IMPORTANT: The "endpoints" array MUST NOT be empty. You MUST include endpoints for ALL entities.

Include per-endpoint: id (unique like "ep-1"), resource, method, path, description, auth flag, roles array, requestBody (field-to-type map), responseBody (field-to-type map), queryParams (field-to-type map), validation rules (string array), and error responses (string array with status codes like "400 Validation error", "401 Unauthenticated", "404 Not found").

Return ONLY valid JSON in the ApiDesign format.`;

export function buildDesignApiPrompt(requirement: string): string {
  return DESIGN_API_PROMPT.replace('{requirement}', requirement);
}

export function buildProDesignApiPrompt(
  projectName: string,
  apiStyle: string,
  dataModel: string,
  context: string
): string {
  return PRO_DESIGN_API_PROMPT.replace('{projectName}', projectName)
    .replace('{apiStyle}', apiStyle)
    .replace('{dataModel}', dataModel)
    .replace('{context}', context);
}
