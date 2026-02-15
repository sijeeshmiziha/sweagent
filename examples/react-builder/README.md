# React Builder Example

Generates React app configuration from GraphQL schemas using sub-agent orchestration.

## Quick Start

```bash
npm install
cp .env.example .env              # add OPENAI_API_KEY
npm run example:react-builder      # interactive prompts
```

## What It Does

Uses an orchestrator with `graphql-analyzer` and `config-validator` sub-agents. Parses a GraphQL schema to understand the data structure, then generates a complete React app configuration: app settings, modules, pages, form fields, API hooks, and branding.

## Run

```bash
# Interactive -- prompts for GraphQL schema
npm run example:react-builder

# One-shot with schema
GRAPHQL_SCHEMA="type Query { users: [User!]! } type User { id: ID! name: String! }" npm run example:react-builder

# Direct script
npm run example -- examples/react-builder/01-react-builder-agent.ts
```

## Inputs

| Variable         | Description                          | Default       |
| ---------------- | ------------------------------------ | ------------- |
| `OPENAI_API_KEY` | OpenAI API key                       | **required**  |
| `PROVIDER`       | AI provider                          | `openai`      |
| `MODEL`          | Model name                           | `gpt-4o-mini` |
| `GRAPHQL_SCHEMA` | GraphQL schema string (skips prompt) | --            |
| `MAX_ITERATIONS` | Max orchestrator iterations          | `10`          |

## Output

React app config JSON with app metadata, modules, pages, fields, API hooks, and branding.

## Integration with Coding Agents

```typescript
import { runReactBuilderAgent } from 'sweagent';
import { writeFileSync } from 'fs';

const result = await runReactBuilderAgent({
  input: 'type Query { users: [User!]! } type User { id: ID! name: String! email: String! }',
  model: { provider: 'openai', model: 'gpt-4o-mini' },
});
writeFileSync('react-config.json', result.output);

// Cursor: "Generate React components and pages from @react-config.json"
```

## Related

- [Frontend Architect](../frontend-architect/) -- Higher-level frontend architecture
- [DB Designer](../db-designer/) -- Another orchestrator pattern example
- [Module Reference](../../src/modules/react-builder/README.md) -- Full API docs
