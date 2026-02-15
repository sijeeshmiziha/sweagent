/**
 * Design prompts for auth-designer
 */

export const DESIGN_AUTH_PROMPT = `## Requirements:
{requirement}

Design the authentication and authorization system. Include:

1. Strategy: jwt, session, or oauth (choose based on requirements).
2. Flows: signup, login, logout, password reset (if applicable). Each flow with numbered steps, frontend/backend side, action, and details.
3. Middleware: route protection middleware, API auth middleware. Each with name, purpose, and behavior list.
4. Roles: role definitions with name, description, and permissions list.
5. Policies: security policies grouped by area (passwords, tokens, CORS, rate limiting, etc.).

Return ONLY valid JSON:
{
  "strategy": "jwt" | "session" | "oauth",
  "flows": [{ "name": "signup", "description": "...", "steps": [{ "order": 1, "side": "frontend", "action": "...", "details": "..." }] }],
  "middleware": [{ "name": "authenticateRequest", "purpose": "...", "behavior": ["..."] }],
  "roles": [{ "name": "user", "description": "...", "permissions": ["..."] }],
  "policies": [{ "area": "passwords", "rules": ["..."] }]
}`;

export function buildDesignAuthPrompt(requirement: string): string {
  return DESIGN_AUTH_PROMPT.replace('{requirement}', requirement);
}
