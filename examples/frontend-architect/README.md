# Frontend Architect Example

Plans frontend architecture with pages, components, state management, and routing.

## Quick Start

```bash
npm install
cp .env.example .env                  # add OPENAI_API_KEY
npm run example:frontend-architect     # interactive prompts
```

## What It Does

Uses an orchestrator with `page-planner`, `component-analyzer`, and `framework-selector` sub-agents. Produces a frontend architecture design with page specifications, reusable component taxonomy, routing strategy, and state management approach.

## Run

```bash
# Interactive -- prompts for frontend requirements
npm run example:frontend-architect

# One-shot
REQUIREMENT="Dashboard app with users, analytics, settings" npm run example:frontend-architect

# Direct script
npm run example -- examples/frontend-architect/01-frontend-architect-agent.ts
```

## Inputs

| Variable         | Description                          | Default       |
| ---------------- | ------------------------------------ | ------------- |
| `OPENAI_API_KEY` | OpenAI API key                       | **required**  |
| `PROVIDER`       | AI provider                          | `openai`      |
| `MODEL`          | Model name                           | `gpt-4o-mini` |
| `REQUIREMENT`    | Frontend requirements (skips prompt) | --            |

## Output

Frontend design JSON with pages, reusable components, state management strategy, and routing configuration.

## Integration with Coding Agents

```typescript
import { runFrontendArchitectAgent } from 'sweagent';
import { writeFileSync } from 'fs';

const result = await runFrontendArchitectAgent({
  input: 'Fitness app with Next.js. Pages: dashboard, workout log, nutrition, goals, profile.',
  model: { provider: 'openai', model: 'gpt-4o-mini' },
});
writeFileSync('frontend-design.json', result.output);

// Cursor: "Scaffold the Next.js pages and components from @frontend-design.json"
```

## Related

- [React Builder](../react-builder/) -- Generate React app configs from GraphQL
- [Next.js Builder](../nextjs-builder/) -- Generate Next.js App Router configs
- [Module Reference](../../src/modules/frontend-architect/README.md) -- Full API docs
