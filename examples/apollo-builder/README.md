# Apollo Builder Example

Generates Apollo Federation v2 subgraph configurations with modules, types, resolvers, and datasources.

## Quick Start

```bash
npm install
cp .env.example .env              # add OPENAI_API_KEY
npm run example:apollo-builder     # interactive prompts
```

## What It Does

Uses an orchestrator with `schema-generator` and `resolver-planner` sub-agents. Takes data models and API designs as input and generates Apollo-specific configuration: GraphQL type definitions, resolver operations, datasource mappings, and federation directives.

## Run

```bash
# Interactive -- prompts for requirements
npm run example:apollo-builder

# One-shot
REQUIREMENT="Task manager with users, projects, tasks" npm run example:apollo-builder

# Direct script
npm run example -- examples/apollo-builder/01-apollo-builder-agent.ts
```

## Inputs

| Variable         | Description                                    | Default       |
| ---------------- | ---------------------------------------------- | ------------- |
| `OPENAI_API_KEY` | OpenAI API key                                 | **required**  |
| `PROVIDER`       | AI provider                                    | `openai`      |
| `MODEL`          | Model name                                     | `gpt-4o-mini` |
| `REQUIREMENT`    | Data model and API requirements (skips prompt) | --            |

## Output

Subgraph config JSON with modules, GraphQL types, resolver operations, datasources, and auth directives.

## Integration with Coding Agents

```typescript
import { runApolloBuilderAgent } from 'sweagent';
import { writeFileSync } from 'fs';

const result = await runApolloBuilderAgent({
  input: 'Task manager: User, Project, Task. Roles: admin, member.',
  model: { provider: 'openai', model: 'gpt-4o-mini' },
});
writeFileSync('subgraph-config.json', result.output);

// Cursor: "Generate Apollo subgraph project from @subgraph-config.json"
```

## Related

- [API Designer](../api-designer/) -- Design GraphQL APIs before generating subgraphs
- [Backend Architect](../backend-architect/) -- Higher-level backend architecture
- [Express Builder](../express-builder/) -- REST alternative to GraphQL
- [Module Reference](../../src/modules/apollo-builder/README.md) -- Full API docs
