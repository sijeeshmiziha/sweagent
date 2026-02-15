/**
 * Design stage prompts - pro-level API routes and implementation details
 */

const DESIGN_CONTEXT = `## Project context (all sections so far):
{priorSections}`;

export const DESIGN_API_ROUTES_PROMPT = `${DESIGN_CONTEXT}

Write the next markdown section in this exact format:

**## API Routes**
- Group by domain: ### Authentication Endpoints, ### Exercise Endpoints, ### Workout Endpoints, etc.
- For each endpoint use: #### METHOD \`/path\` (e.g. #### POST \`/api/auth/signup\`)
- Under each endpoint include:
  - **Purpose**: one line
  - **Request Body** or **Query Parameters** (and **Validation** bullets: required, format, lengths)
  - **Response on Success (status)**: code block with example JSON (e.g. 200, 201)
  - **Response on Error**: bullets (e.g. 400 validation, 401, 403, 404, 500 with message)
  - **Side Effects** or **Implementation** where relevant (e.g. "Creates User and UserProfile; sets auth cookie")
- Use code blocks ONLY for request/response JSON examples. No JSON elsewhere.

Output only markdown. Do NOT output JSON except inside code blocks.`;

export const DESIGN_IMPLEMENTATION_PROMPT = `${DESIGN_CONTEXT}

## API Routes (already written):
{apiRoutes}

Write the next markdown section in this exact format:

**## Implementation Details**
- **### File Structure** — Full directory tree in a **code block** (e.g. src/app/(auth)/login/page.tsx, src/app/api/auth/signup/route.ts, src/components/..., src/lib/, src/models/). Show the real layout a developer would create.
- **### Environment Variables** — List with comments (e.g. MONGODB_URI=... # connection string, JWT_SECRET=... # change in production).
- **### Dependencies to Install** — npm install line and short explanation per dependency (e.g. mongoose: MongoDB ODM; bcryptjs: password hashing; jsonwebtoken: JWT; cookie: cookie parsing).
- **### Key Setup** — One subsection per concern: **MongoDB connection** (file path, purpose, 3–5 bullets), **JWT utilities** (file path, purpose; cookie name, maxAge, httpOnly, secure; generateToken/verifyToken/setAuthCookie/clearAuthCookie), **Auth middleware** (file path, authenticateRequest behavior), **External API client** if any (file path, purpose).
- If the plan is UI-heavy, add **### UI Component Guidelines** (controlled inputs, validation, loading/error states) and **### Error Handling Standards** (API error JSON shape, HTTP status codes: 200, 201, 400, 401, 403, 404, 500).

Output only markdown. Do NOT output JSON.`;

export function buildDesignApiRoutesPrompt(priorSections: string): string {
  return DESIGN_API_ROUTES_PROMPT.replace('{priorSections}', priorSections);
}

export function buildDesignImplementationPrompt(priorSections: string, apiRoutes: string): string {
  return DESIGN_IMPLEMENTATION_PROMPT.replace('{priorSections}', priorSections).replace(
    '{apiRoutes}',
    apiRoutes
  );
}
