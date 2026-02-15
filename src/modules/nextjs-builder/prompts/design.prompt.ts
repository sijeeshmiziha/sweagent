/**
 * Design prompt for Next.js config generation
 */

export const DESIGN_NEXTJS_PROMPT = `## Requirements:
{requirement}

Generate a Next.js App Router application configuration. Include:

1. Pages: app router pages with path, name, access level, route group, purpose, data fetching strategy.
2. Layouts: shared layouts with route groups (e.g. (auth), (dashboard)), components they include.
3. API Routes: route handlers with path, HTTP methods, auth requirement, description.
4. Server Actions: named actions with module, description, and paths they revalidate.
5. Middleware: list of middleware behaviors (e.g. "redirect unauthenticated to /login").
6. Env vars: NEXTAUTH_SECRET, DATABASE_URL, etc.
7. Packages: recommended npm packages.

Return ONLY valid JSON:
{
  "appName": "my-app",
  "pages": [{
    "path": "/dashboard",
    "name": "Dashboard",
    "access": "protected",
    "routeGroup": "(dashboard)",
    "purpose": "Main dashboard with stats",
    "hasForm": false,
    "formFields": [],
    "dataFetching": "server",
    "actions": []
  }],
  "layouts": [{
    "name": "DashboardLayout",
    "path": "app/(dashboard)/layout.tsx",
    "routeGroup": "(dashboard)",
    "components": ["Sidebar", "Header"],
    "purpose": "Shared layout for authenticated pages"
  }],
  "apiRoutes": [{
    "path": "/api/users",
    "methods": ["GET", "POST"],
    "auth": true,
    "description": "User CRUD endpoints"
  }],
  "serverActions": [{
    "name": "createUser",
    "module": "users",
    "description": "Create a new user",
    "revalidates": ["/dashboard/users"]
  }],
  "middleware": ["Redirect unauthenticated users to /login"],
  "envVars": ["DATABASE_URL", "NEXTAUTH_SECRET"],
  "packages": ["next-auth", "prisma", "@prisma/client", "tailwindcss"]
}`;

export function buildDesignNextjsPrompt(requirement: string): string {
  return DESIGN_NEXTJS_PROMPT.replace('{requirement}', requirement);
}
