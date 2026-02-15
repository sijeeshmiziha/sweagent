# Express Builder Example

Generates Express.js REST API configurations with controllers, models, middleware, and routes.

## Quick Start

```bash
npm install
cp .env.example .env              # add OPENAI_API_KEY
npm run example:express-builder    # interactive prompts
```

## What It Does

Uses an orchestrator with `route-generator` and `middleware-configurator` sub-agents. Takes data models and API designs as input and generates Express.js-specific configuration: routers, controller stubs, model definitions, middleware pipeline, and environment variables.

## Run

```bash
# Interactive -- prompts for requirements
npm run example:express-builder

# One-shot
REQUIREMENT="Task manager with JWT auth, User/Project/Task models" npm run example:express-builder

# Direct script
npm run example -- examples/express-builder/01-express-builder-agent.ts
```

## Inputs

| Variable         | Description                                    | Default       |
| ---------------- | ---------------------------------------------- | ------------- |
| `OPENAI_API_KEY` | OpenAI API key                                 | **required**  |
| `PROVIDER`       | AI provider                                    | `openai`      |
| `MODEL`          | Model name                                     | `gpt-4o-mini` |
| `REQUIREMENT`    | API and data model requirements (skips prompt) | --            |

## Output

Express config JSON with routers, models, middleware, and env vars.

## Integration with Coding Agents

```typescript
import { runExpressBuilderAgent } from 'sweagent';
import { writeFileSync } from 'fs';

const result = await runExpressBuilderAgent({
  input: 'Task manager: User, Project, Task models. REST API with JWT auth.',
  model: { provider: 'openai', model: 'gpt-4o-mini' },
});
writeFileSync('express-config.json', result.output);

// Cursor: "Generate Express.js project from @express-config.json"
```

## Related

- [Backend Architect](../backend-architect/) -- Higher-level backend architecture
- [API Designer](../api-designer/) -- Design APIs before generating Express configs
- [Auth Designer](../auth-designer/) -- Auth system design for Express middleware
- [Module Reference](../../src/modules/express-builder/README.md) -- Full API docs
