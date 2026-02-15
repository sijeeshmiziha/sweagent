# Next.js Builder Example

Generates Next.js App Router configurations with pages, layouts, API routes, server actions, and middleware.

## Quick Start

```bash
npm install
cp .env.example .env              # add OPENAI_API_KEY
npm run example:nextjs-builder     # interactive prompts
```

## What It Does

Uses an orchestrator with `route-planner` and `api-route-generator` sub-agents. Takes frontend requirements and produces Next.js-specific configuration: page components, layouts, API route handlers, server actions, and middleware definitions for the App Router.

## Run

```bash
# Interactive -- prompts for frontend requirements
npm run example:nextjs-builder

# One-shot
REQUIREMENT="E-commerce with product catalog, cart, checkout" npm run example:nextjs-builder

# Direct script
npm run example -- examples/nextjs-builder/01-nextjs-builder-agent.ts
```

## Inputs

| Variable         | Description                          | Default       |
| ---------------- | ------------------------------------ | ------------- |
| `OPENAI_API_KEY` | OpenAI API key                       | **required**  |
| `PROVIDER`       | AI provider                          | `openai`      |
| `MODEL`          | Model name                           | `gpt-4o-mini` |
| `REQUIREMENT`    | Frontend requirements (skips prompt) | --            |

## Output

Next.js config JSON with pages, layouts, API routes, server actions, and middleware.

## Integration with Coding Agents

```typescript
import { runNextjsBuilderAgent } from 'sweagent';
import { writeFileSync } from 'fs';

const result = await runNextjsBuilderAgent({
  input: 'Task manager: dashboard, project pages, Kanban board, auth, SEO',
  model: { provider: 'openai', model: 'gpt-4o-mini' },
});
writeFileSync('nextjs-config.json', result.output);

// Cursor: "Scaffold Next.js App Router project from @nextjs-config.json"
```

## Related

- [Frontend Architect](../frontend-architect/) -- Higher-level frontend architecture
- [React Builder](../react-builder/) -- React config from GraphQL schemas
- [Module Reference](../../src/modules/nextjs-builder/README.md) -- Full API docs
