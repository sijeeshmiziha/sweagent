/**
 * Requirements stage prompts - pro-level markdown sections
 */

const CONTEXT_BLOCK = `## Project description / context:
{context}`;

export const REQUIREMENTS_OVERVIEW_PROMPT = `${CONTEXT_BLOCK}

Using the project description above, write two markdown sections in this exact format:

1. **## Overview** — One paragraph only (2–4 sentences) summarizing the project and its purpose.
2. **## Tech Stack** — Bullet list with category labels: - **Frontend**: ... (include framework and versions if applicable, e.g. Next.js 16, React 19, TypeScript, Tailwind v4), - **Database**: ... (e.g. MongoDB with Mongoose), - **Authentication**: ... (e.g. JWT in HTTP-only cookies, bcrypt), - **API**: ... (REST or GraphQL), - **Backend**: ... Include versions and key libraries where applicable.

Output only these two sections in markdown. Do NOT output JSON.`;

export const REQUIREMENTS_FEATURE_DATA_PROMPT = `${CONTEXT_BLOCK}

## Already written (Overview + Tech Stack):
{overviewAndTechStack}

Write the next two markdown sections in this exact format:

1. **## Feature Decisions** — Use ### per feature/area (e.g. ### Workout Tracking, ### Nutrition Tracking). Under each, bullets for key product decisions; use sub-bullets for options where relevant (e.g. goal types: weight, strength, consistency, custom).
2. **## Data Models** — For each entity use ### EntityName. For each field use exactly one line: \`field_name\`: description (type, required/optional, unique if applicable). For references write "Reference to EntityName". Include User, profile/settings, and all domain entities.

Output only markdown. Do NOT output JSON.`;

export const REQUIREMENTS_PAGES_PROMPT = `${CONTEXT_BLOCK}

## Already written:
{priorSections}

Write the next markdown section in this exact format:

**## Pages and Routes**
- **### Public Pages (No Authentication Required)** and **### Protected Pages (Authentication Required)**.
- For each page use: #### \`/path\` - Page Title
- Under each page, include bullets for: purpose, form fields and validation (e.g. "Form validation: Required fields, valid email format"), buttons/actions, empty states, redirects on success/error (e.g. "On success: Redirect to /dashboard"), key UI (cards, sidebar, charts). Match the depth of a pro implementation spec so a developer can build the page from this alone.

Output only markdown. Do NOT output JSON.`;

export const REQUIREMENTS_AUTH_PROMPT = `${CONTEXT_BLOCK}

## Already written:
{priorSections}

Write the next markdown section in this exact format:

**## Authentication Flow** — Use these subsections: ### Sign Up Flow, ### Login Flow, ### Logout Flow, ### Protected Route Middleware, ### API Authentication Middleware.
- Use **numbered steps** in each flow. Include both frontend and backend steps (e.g. "4. Frontend sends POST to /api/auth/signup with { name, email, password }", "5. Backend validates input", "6. Backend hashes password with bcrypt (10 rounds)", "7. Backend sets JWT in HTTP-only cookie (name, maxAge, httpOnly, secure, sameSite)").
- For middleware: steps for cookie check, JWT verify, attach userId to request, return 401 when invalid.

Output only markdown. Do NOT output JSON.`;

export function buildRequirementsOverviewPrompt(context: string): string {
  return REQUIREMENTS_OVERVIEW_PROMPT.replace('{context}', context);
}

export function buildRequirementsFeatureDataPrompt(
  context: string,
  overviewAndTechStack: string
): string {
  return REQUIREMENTS_FEATURE_DATA_PROMPT.replace('{context}', context).replace(
    '{overviewAndTechStack}',
    overviewAndTechStack
  );
}

export function buildRequirementsPagesPrompt(context: string, priorSections: string): string {
  return REQUIREMENTS_PAGES_PROMPT.replace('{context}', context).replace(
    '{priorSections}',
    priorSections
  );
}

export function buildRequirementsAuthPrompt(context: string, priorSections: string): string {
  return REQUIREMENTS_AUTH_PROMPT.replace('{context}', context).replace(
    '{priorSections}',
    priorSections
  );
}
