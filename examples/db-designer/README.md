# DB Designer Example

Orchestrator agent with `entity-analyzer` and `schema-refiner` sub-agents producing MongoDB schemas from natural language.

## Quick Start

```bash
npm install
cp .env.example .env          # add OPENAI_API_KEY
npm run example:db-designer    # interactive prompts
```

## What It Does

The orchestrator receives a natural-language requirement and delegates to the `entity-analyzer` sub-agent to extract entities and relationships, then to the `schema-refiner` sub-agent to normalize and validate. Tools like `design_database` and `validate_schema` handle schema generation and validation.

## Run

```bash
# Interactive -- prompts for requirement
npm run example:db-designer

# One-shot
REQUIREMENT="E-commerce with users, orders, products" npm run example:db-designer

# Direct script
npm run example -- examples/db-designer/01-db-designer-agent.ts
```

## Inputs

| Variable         | Description                        | Default       |
| ---------------- | ---------------------------------- | ------------- |
| `OPENAI_API_KEY` | OpenAI API key                     | **required**  |
| `PROVIDER`       | AI provider                        | `openai`      |
| `MODEL`          | Model name                         | `gpt-4o-mini` |
| `REQUIREMENT`    | Project description (skips prompt) | --            |
| `MAX_ITERATIONS` | Max orchestrator iterations        | `10`          |

## Output

MongoDB project schema JSON with modules, fields, relationships, indexes, and validation rules.

## Integration with Coding Agents

```typescript
import { runDbDesignerAgent } from 'sweagent';
import { writeFileSync } from 'fs';

const result = await runDbDesignerAgent({
  input: 'Blog platform with users, posts, comments, and tags',
  model: { provider: 'openai', model: 'gpt-4o-mini' },
});
writeFileSync('db-schema.json', result.output);

// Cursor: "Create Mongoose models from @db-schema.json"
```

## Related

- [Data Modeler](../data-modeler/) -- MongoDB + PostgreSQL data modeling
- [React Builder](../react-builder/) -- Another orchestrator pattern example
- [Module Reference](../../src/modules/db-designer/README.md) -- Full API docs
