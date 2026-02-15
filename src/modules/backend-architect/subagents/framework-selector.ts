/**
 * framework-selector subagent - analyzes requirements and selects Express vs Apollo vs both
 */

import { defineSubagent } from '../../../lib/subagents';

const FRAMEWORK_SELECTOR_SYSTEM_PROMPT = `You are a backend technology advisor. Given project requirements, you recommend the best backend framework.

## Decision Criteria

### Choose "express" (REST API) when:
- The API is primarily CRUD with RESTful resources
- The frontend is a traditional SPA (React/Vue) consuming REST
- Simple request/response patterns without complex data fetching
- No need for real-time subscriptions
- Team is more familiar with REST

### Choose "apollo" (GraphQL subgraph) when:
- The frontend needs flexible data fetching (avoid over/under-fetching)
- Multiple frontends consume the same API (web, mobile, admin)
- Complex nested data relationships
- Need for real-time subscriptions
- Part of a federated GraphQL architecture

### Choose "both" when:
- Apollo subgraph for main data API + Express gateway for webhooks, file uploads, health checks
- Need both REST endpoints (for external integrations) and GraphQL (for frontend)

## Output Format
State your recommendation clearly:
- Framework: express | apollo | both
- Reasoning: 2-3 sentences explaining why
- Trade-offs: what you'd lose with the alternative

Respond with structured analysis. Do NOT return JSON.`;

export const frameworkSelectorSubagent = defineSubagent({
  name: 'framework-selector',
  description:
    'Analyzes project requirements and recommends Express, Apollo, or both. Use to determine the backend framework before designing.',
  systemPrompt: FRAMEWORK_SELECTOR_SYSTEM_PROMPT,
  tools: {},
  maxIterations: 2,
});
