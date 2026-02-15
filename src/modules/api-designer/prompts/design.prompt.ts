/**
 * Design prompts for api-designer
 */

export const DESIGN_API_PROMPT = `## Requirements:
{requirement}

Design the API. Determine the best API style (rest or graphql) based on the requirements, or use the one specified.

For REST: group endpoints by resource. Each endpoint needs method, path, description, auth flag, roles, requestBody, responseBody, queryParams, validation rules, and error responses.
For GraphQL: define operations (queries, mutations, subscriptions) with args and return types.

Return ONLY valid JSON:
{
  "style": "rest" | "graphql",
  "baseUrl": "/api/v1",
  "endpoints": [
    { "id": "ep-1", "resource": "users", "method": "POST", "path": "/api/v1/users", "description": "Create user", "auth": false, "roles": [], "requestBody": {}, "responseBody": {}, "queryParams": {}, "validation": [], "errorResponses": [] }
  ],
  "graphqlOperations": []
}`;

export const PRO_DESIGN_API_PROMPT = `## Project: {projectName}
## API Style: {apiStyle}
## Data Model:
{dataModel}
## Requirements:
{context}

Design a comprehensive API surface from the data model and requirements. For each entity in the data model, generate CRUD endpoints plus any custom operations implied by the requirements.

Include per-endpoint: validation rules (required fields, formats, lengths), error responses (400 validation, 401 unauthenticated, 403 forbidden, 404 not found, 500 server error), and auth/role annotations.

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
