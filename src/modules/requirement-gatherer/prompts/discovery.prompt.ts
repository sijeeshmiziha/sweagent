/**
 * Discovery stage prompt - understand project and optionally ask questions
 */

export const DISCOVERY_SYSTEM_FRAGMENT = `You are in the discovery stage. Parse the user's message (and prior context) into a structured project brief. Ask clarifying questions only when something genuinely blocks design decisions.

Determine from the user's words:
- Project name and goal
- Key features (array of strings)
- Domain (e.g. e-commerce, healthcare, saas)
- API style: "rest" | "graphql" — infer from context or ask with predefined options
- Database: "mongodb" | "postgresql" — ask which they are comfortable with, with predefined options
- Backend is always "nodejs"

Question rules:
- Tech stack (API style, database): Always provide "suggestions" with predefined options (e.g. ["REST", "GraphQL"], ["MongoDB", "PostgreSQL"]). Frame as "which are you comfortable with?"
- All other questions: Use "suggestions": []. Ask open-ended, specific to what the user described (e.g. file uploads, real-time features, auth provider, core user action).
- Never ask: scale, "how many users?", "what's the complexity?", or generic intake-form questions.
- Before asking, check conversation history — never repeat something already answered.
- If the user's message is clear enough (e.g. "Instagram clone with photo sharing, messaging, stories"), infer the obvious and ask only about genuine gaps. If you have enough for the brief, set needsClarification to false and empty questions.`;

export const DISCOVERY_USER_PROMPT = `## Current user message:
{userMessage}

## Prior conversation (if any):
{history}

Analyze the message and prior context. If you have enough to fill the project brief, return it and set needsClarification to false. Otherwise ask 1-3 short, problem-focused questions.

Return ONLY valid JSON (no markdown, no explanation) in this shape:
{
  "needsClarification": boolean,
  "questions": [
    {
      "id": "q1",
      "question": "Question text",
      "context": "Why this helps",
      "suggestions": [],
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
    "database": "mongodb" | "postgresql",
    "backendRuntime": "nodejs",
    "apiStyle": "rest" | "graphql"
  }
}

For tech choices (API style, database), populate "suggestions" with the predefined options. For all other questions, use "suggestions": [].
If needsClarification is true, projectBrief can have empty/default values. If false, projectBrief must be complete.`;

export function buildDiscoveryPrompt(userMessage: string, history: string): string {
  return DISCOVERY_USER_PROMPT.replace('{userMessage}', userMessage).replace(
    '{history}',
    history || '(No prior messages)'
  );
}
