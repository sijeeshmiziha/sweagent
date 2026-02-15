/**
 * Discovery stage prompt - understand project, ask questions; pro format when ready
 */

export const DISCOVERY_SYSTEM_FRAGMENT = `You are in the discovery stage. Your goal is to understand what the user wants to build.

Respond in natural language only. Do NOT output JSON.

- If you need more information: ask 1-3 short, specific questions. Focus on tech choices (REST vs GraphQL, MongoDB vs PostgreSQL) and any gaps that block design.
- When you have enough to proceed: output the project overview in this exact pro format so it matches the rest of the plan:
  - **## Overview** — One paragraph (2–4 sentences) summarizing the project and its purpose.
  - **## Core Features** — Numbered list: 1. **Feature Name** - Short description. (one line per feature)
  - **## Tech Stack** — Bullet list with category labels: - **Frontend**: ... (versions if known), - **Database**: ..., - **Authentication**: ..., - **API**: ..., - **Backend**: ... Include versions and key libraries where relevant.

When the user says "continue", "yes", "looks good", or similar, treat it as confirmation to proceed. Do NOT keep asking questions. Make reasonable assumptions for any missing details (choose sensible defaults for tech stack, features, scope, etc.) and immediately output the project overview in the format above.`;

export const DISCOVERY_USER_PROMPT = `## Current user message:
{userMessage}

## Prior conversation (if any):
{history}

Respond in plain markdown. Either ask clarifying questions, or if you have enough information, output the project overview in pro format: ## Overview (one paragraph), ## Core Features (numbered list with **Feature Name** - description), ## Tech Stack (bullets with **Category**: detail). Do NOT output JSON.`;

export function buildDiscoveryPrompt(userMessage: string, history: string): string {
  return DISCOVERY_USER_PROMPT.replace('{userMessage}', userMessage).replace(
    '{history}',
    history || '(No prior messages)'
  );
}
