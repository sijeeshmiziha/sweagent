# Backend Architect Example

Plans backend architecture with framework selection, service design, middleware stack, and folder structure.

## Quick Start

```bash
npm install
cp .env.example .env              # add OPENAI_API_KEY
npm run example:backend-architect  # interactive prompts
```

## What It Does

Uses an orchestrator with `framework-selector` and `service-planner` sub-agents. Analyzes requirements and produces a backend architecture design with framework choice (Express/Fastify), services, middleware pipeline, route structure, and project folder layout.

## Run

```bash
# Interactive -- prompts for project requirements
npm run example:backend-architect

# One-shot
REQUIREMENT="Task manager with CRUD, auth, MongoDB" npm run example:backend-architect

# Direct script
npm run example -- examples/backend-architect/01-backend-architect-agent.ts
```

## Inputs

| Variable         | Description                         | Default       |
| ---------------- | ----------------------------------- | ------------- |
| `OPENAI_API_KEY` | OpenAI API key                      | **required**  |
| `PROVIDER`       | AI provider                         | `openai`      |
| `MODEL`          | Model name                          | `gpt-4o-mini` |
| `REQUIREMENT`    | Project requirements (skips prompt) | --            |

## Output

Backend design JSON with framework choice, services, middleware, routes, and folder structure.

## Integration with Coding Agents

```typescript
import { runBackendArchitectAgent } from 'sweagent';
import { writeFileSync } from 'fs';

const result = await runBackendArchitectAgent({
  input: 'Task manager with users, projects, tasks, role-based auth, MongoDB',
  model: { provider: 'openai', model: 'gpt-4o-mini' },
});
writeFileSync('backend-design.json', result.output);

// Cursor: "Scaffold the backend project from @backend-design.json"
```

## Related

- [Express Builder](../express-builder/) -- Generate Express.js REST API configs
- [Apollo Builder](../apollo-builder/) -- Generate GraphQL subgraph configs
- [Auth Designer](../auth-designer/) -- Dedicated auth system design
- [Module Reference](../../src/modules/backend-architect/README.md) -- Full API docs
