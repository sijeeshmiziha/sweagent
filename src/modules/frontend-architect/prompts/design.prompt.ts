/**
 * Design prompts for frontend-architect
 */

export const DESIGN_FRONTEND_PROMPT = `## Requirements:
{requirement}

Design the frontend architecture. Include:

1. Pages: public and protected pages. For each page: path, name, access level, purpose, form fields (with validation), actions, empty state, error state, redirect on success, key UI elements.
2. Components: reusable components. For each: name, type (layout/shared/form/display/navigation), purpose, props, and which pages use it.
3. State management: describe the state strategy (e.g. React Server Components for data, client state for forms).
4. Routing notes: any special routing behavior (redirects, guards, nested routes).

Return ONLY valid JSON:
{
  "pages": [{ "path": "/login", "name": "Login", "access": "public", "purpose": "...", "formFields": [{ "name": "email", "type": "email", "required": true, "validation": "valid email format" }], "actions": ["Submit login form"], "emptyState": "", "errorState": "Show error message", "redirectOnSuccess": "/dashboard", "keyUiElements": ["Email input", "Password input", "Submit button"] }],
  "components": [{ "name": "Navbar", "type": "navigation", "purpose": "...", "props": ["user"], "usedIn": ["/dashboard", "/profile"] }],
  "stateManagement": "...",
  "routingNotes": "..."
}`;

export function buildDesignFrontendPrompt(requirement: string): string {
  return DESIGN_FRONTEND_PROMPT.replace('{requirement}', requirement);
}
