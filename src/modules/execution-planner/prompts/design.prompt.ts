/**
 * Design prompts for execution-planner
 */

export const CREATE_EXECUTION_PLAN_PROMPT = `## Full Plan Context:
{context}

Create a comprehensive execution plan. Include:

1. **phases**: Implementation phases (Foundation, Auth, Core Features, etc.). Each phase has numbered steps with concrete actions (e.g. "1. Install dependencies", "2. Create User model").
2. **currentState**: What the project starts with (e.g. "vanilla Next.js, no DB, no auth").
3. **desiredEndState**: What must work when done (user capabilities + technical verification).
4. **edgeCases**: Edge cases per area with scenario, handling strategy, and severity (critical/warning/info).
5. **securityNotes**: Security considerations (password hashing, JWT config, rate limiting, etc.).
6. **performanceNotes**: Performance considerations (indexing, caching, lazy loading, etc.).
7. **testingChecklist**: Manual testing items per flow with expected results.

Return ONLY valid JSON:
{
  "phases": [{ "name": "Phase 1: Foundation", "description": "...", "steps": [{ "order": 1, "action": "Install dependencies", "details": "npm install mongoose bcryptjs jsonwebtoken" }] }],
  "currentState": "...",
  "desiredEndState": "...",
  "edgeCases": [{ "area": "Authentication", "scenario": "Email already exists", "handling": "Return 400 with clear message", "severity": "critical" }],
  "securityNotes": ["..."],
  "performanceNotes": ["..."],
  "testingChecklist": [{ "flow": "Auth Flow", "item": "Sign up with valid credentials", "expectedResult": "Account created, redirected to dashboard" }]
}`;

export function buildCreateExecutionPlanPrompt(context: string): string {
  return CREATE_EXECUTION_PLAN_PROMPT.replace('{context}', context);
}
