# API Designer Example

Designs enterprise-quality REST or GraphQL APIs with endpoint analysis, request/response contracts, and validation rules.

## Quick Start

```bash
npm install
cp .env.example .env          # add OPENAI_API_KEY
npm run example:api-designer   # interactive prompts
```

## What It Does

Uses an orchestrator-worker pattern with `endpoint-analyzer` and `contract-designer` sub-agents. Generates complete API designs with endpoints, methods, request/response shapes, auth requirements, validation rules, and error responses.

## Run

```bash
# Interactive -- prompts for requirement and API style (REST/GraphQL)
npm run example:api-designer

# One-shot
REQUIREMENT="Task manager with users, projects, tasks" npm run example:api-designer

# Direct script
npm run example -- examples/api-designer/01-api-designer-agent.ts
```

## Inputs

| Variable         | Description                     | Default       |
| ---------------- | ------------------------------- | ------------- |
| `OPENAI_API_KEY` | OpenAI API key                  | **required**  |
| `PROVIDER`       | AI provider                     | `openai`      |
| `MODEL`          | Model name                      | `gpt-4o-mini` |
| `REQUIREMENT`    | API requirements (skips prompt) | --            |

The interactive mode also prompts for **API style** (REST or GraphQL).

## Output

`ApiDesign` JSON with REST endpoints or GraphQL operations, request/response contracts, auth, and validation.

```json
{
  "style": "rest",
  "baseUrl": "/api/v1",
  "endpoints": [
    { "id": "create-task", "method": "POST", "path": "/tasks", "auth": true, ... }
  ]
}
```

## Integration with Coding Agents

```typescript
import { runApiDesignerAgent } from 'sweagent';
import { writeFileSync } from 'fs';

const result = await runApiDesignerAgent({
  input: 'Task manager with users, projects, tasks\n\nAPI style: rest',
  model: { provider: 'openai', model: 'gpt-4o-mini' },
});
writeFileSync('api-design.json', result.output);

// Cursor: "Implement REST routes from @api-design.json using Express"
```

## Related

- [Express Builder](../express-builder/) -- Generate Express.js configs from API designs
- [Apollo Builder](../apollo-builder/) -- Generate GraphQL subgraph configs
- [Module Reference](../../src/modules/api-designer/README.md) -- Full API docs
