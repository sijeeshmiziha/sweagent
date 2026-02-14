/**
 * Discovery stage prompt - understand project and optionally ask questions
 */

export const DISCOVERY_SYSTEM_FRAGMENT = `You are in the discovery stage. Your job is to parse the user's message (and any prior context) into a structured project brief, and only ask clarifying questions if something is genuinely unclear.

Determine from the user's words:
- Project name and goal
- Key features (array of strings)
- Domain (e.g. e-commerce, healthcare, saas)
- Scale: small (single team, simple), medium (multiple teams, moderate complexity), large (enterprise, high complexity)
- API style: "rest" | "graphql" - infer from phrases like "REST API", "GraphQL",  or default to "rest" if unclear
- Backend is always "nodejs" for now

If the user has already answered a question, incorporate that. If everything needed for a project brief is clear, set needsClarification to false and empty questions. Only ask 1-3 questions when critical (e.g. "Do you want REST or GraphQL for your API?").`;

export const DISCOVERY_USER_PROMPT = `## Current user message:
{userMessage}

## Prior conversation (if any):
{history}

Analyze the message and prior context. If you have enough to fill the project brief, return it and set needsClarification to false. Otherwise ask 1-3 short questions.

Return ONLY valid JSON (no markdown, no explanation) in this shape:
{
  "needsClarification": boolean,
  "questions": [
    {
      "id": "q1",
      "question": "Question text",
      "context": "Why this helps",
      "suggestions": ["Option A", "Option B"],
      "multiSelect": false,
      "required": true
    }
  ],
  "conversationalMessage": "Brief friendly message to the user",
  "projectBrief": {
    "name": "string",
    "goal": "string",
    "features": ["string"],
    "domain": "string",
    "scale": "small" | "medium" | "large",
    "backendRuntime": "nodejs",
    "apiStyle": "rest" | "graphql"
  }
}

If needsClarification is true, projectBrief can have empty/default values. If false, projectBrief must be complete.`;

export function buildDiscoveryPrompt(userMessage: string, history: string): string {
  return DISCOVERY_USER_PROMPT.replace('{userMessage}', userMessage).replace(
    '{history}',
    history || '(No prior messages)'
  );
}
