# Data Modeler Example

Designs enterprise-quality data models for MongoDB or PostgreSQL with entity analysis, relationship mapping, and schema refinement.

## Quick Start

```bash
npm install
cp .env.example .env          # add OPENAI_API_KEY
npm run example:data-modeler   # interactive prompts
```

## What It Does

Uses an orchestrator-worker pattern with three sub-agents (`entity-analyzer`, `relationship-mapper`, `schema-refiner`) and structured tools (`design_schema`, `validate_data_model`). Produces typed JSON with entities, fields, indexes, and relationships.

## Run

```bash
# Interactive -- prompts for requirement and database type
npm run example:data-modeler

# One-shot
REQUIREMENT="Fitness app with users, workouts, nutrition" npm run example:data-modeler

# Direct script
npm run example -- examples/data-modeler/01-data-modeler-agent.ts
```

## Inputs

| Variable         | Description                        | Default       |
| ---------------- | ---------------------------------- | ------------- |
| `OPENAI_API_KEY` | OpenAI API key                     | **required**  |
| `PROVIDER`       | AI provider                        | `openai`      |
| `MODEL`          | Model name                         | `gpt-4o-mini` |
| `REQUIREMENT`    | Project description (skips prompt) | --            |

The interactive mode also prompts for **target database** (MongoDB or PostgreSQL).

## Output

`DataModelDesign` JSON with entities, fields (name, type, required, unique), indexes, and relationships (1:1, 1:N, M:N).

```json
{
  "type": "mongodb",
  "reasoning": "MongoDB chosen for flexible schema evolution...",
  "entities": [
    { "name": "User", "fields": [...], "indexes": [...], "relations": [] }
  ]
}
```

## Integration with Coding Agents

```typescript
import { runDataModelerAgent } from 'sweagent';
import { writeFileSync } from 'fs';

const result = await runDataModelerAgent({
  input: 'SaaS with organizations, users, projects, billing\n\nTarget database: mongodb',
  model: { provider: 'openai', model: 'gpt-4o-mini' },
});
writeFileSync('data-model.json', result.output);

// Cursor: "Implement Prisma/Mongoose models from @data-model.json"
```

## Related

- [DB Designer](../db-designer/) -- MongoDB-focused schema generation
- [API Designer](../api-designer/) -- Design APIs from data models
- [Module Reference](../../src/modules/data-modeler/README.md) -- Full API docs
