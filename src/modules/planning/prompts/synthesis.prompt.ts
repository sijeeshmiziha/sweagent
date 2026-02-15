/**
 * Synthesis stage prompt - pro-level final sections (order matters for splitting)
 */

const SYNTHESIS_CONTEXT = `## Full plan so far (all sections):
{priorSections}`;

export const SYNTHESIS_SYSTEM_FRAGMENT = `You are in the complete stage. You have the full implementation plan. Output the final sections in markdown, in the exact order specified below, so they can be assembled into the plan.`;

export const SYNTHESIS_USER_PROMPT = `${SYNTHESIS_CONTEXT}

Write the following sections in this exact order. Output only markdown. Do NOT output JSON.

**Block 1 — Implementation Order, Current State, Desired End State**

1. **## Implementation Order** — Phased: ### Phase 1: Foundation, ### Phase 2: Authentication, etc. Under each phase, numbered steps (e.g. "1. Install dependencies", "2. Create User model", "3. Implement POST /api/auth/signup", "4. Create login page"). Be concrete so a developer can follow step-by-step.

2. **## Current State Analysis** — What the project starts with (e.g. vanilla Next.js, no DB, no auth). Then a short bullet list: "What needs to be built from scratch" (all auth, models, API routes, pages, etc.).

3. **## Desired End State** — Short subsections or bullets: (1) For users: what they can do when the app is done; (2) Technical verification: what must work (DB connected, auth working, endpoints returning correct data, etc.); (3) Testing approach: manual flows, API checks, DB checks.

**Block 2 — Edge Cases, Security, Performance, Future Enhancements**

4. **## Edge Cases and Considerations** — ### per area (e.g. ### Authentication, ### Workouts, ### Nutrition, ### Goals, ### Profile, ### General). Under each, bullets for edge cases and how to handle them (e.g. "Email already exists: return 400 with clear message"; "External API down: show error, allow manual entry").

5. **## Security Considerations** — Numbered list: passwords (bcrypt, min length); JWT (HTTP-only cookie, secure flag, strong secret, expiry); API (verify JWT on protected routes, check resource ownership); env (never commit secrets, different values in production).

6. **## Performance Considerations** — Numbered list: DB (index user id and date fields, lean queries, avoid N+1); API (debounce search, cache external API if applicable); frontend (RSC where possible, lazy load heavy components); optional future caching.

7. **## Future Enhancements (Not in Current Scope)** — Short grouped list (e.g. Social, Analytics, Integrations, Mobile, Premium) so scope is clear. One line per group is enough.

**Block 3 — Manual Testing Checklist**

8. **## Manual Testing Checklist** — ### per flow (e.g. ### Authentication Flow, ### Workout Flow, ### Nutrition Flow, ### Goals Flow, ### Profile Flow). Under each, checklist items: - [ ] Description of what to verify (e.g. "- [ ] Sign up with valid credentials creates account", "- [ ] Login with invalid credentials shows error").

Output all eight sections in the order above. Do NOT output JSON.`;

export function buildSynthesisPrompt(priorSections: string): string {
  return SYNTHESIS_USER_PROMPT.replace('{priorSections}', priorSections);
}
