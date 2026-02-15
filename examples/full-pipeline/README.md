# Full Pipeline Examples

Chain all domain agents end-to-end -- from a vague idea to implementation-ready specs for every layer of your stack.

## Pipeline Flow

```
Requirements -> Data Model -> API Design -> Auth Design
  -> Backend Architect -> Frontend Architect -> Execution Plan
```

The extended pipeline (02) also runs code generation builders:

```
... -> Backend Architect -> Express/Apollo Builder
    -> Frontend Architect -> React/Next.js Builder -> Execution Plan
```

## Examples

### 01 - Full Pipeline (7 agents)

Chains 7 agents sequentially. Saves each output to `output/` as JSON.

```bash
npx tsx --env-file=.env examples/full-pipeline/01-full-pipeline.ts
REQUIREMENT="E-commerce platform with payments" npx tsx --env-file=.env examples/full-pipeline/01-full-pipeline.ts
```

### 02 - Pipeline with Builders (9 agents)

Extended pipeline that detects API style (REST/GraphQL) and framework (React/Next.js) to run the appropriate code generation agents.

```bash
npx tsx --env-file=.env examples/full-pipeline/02-pipeline-with-builders.ts
```

## Output Files

After running, check the `output/` directory:

| File                   | Description                             |
| ---------------------- | --------------------------------------- |
| `requirements.json`    | Structured requirements (actors, flows) |
| `data-model.json`      | Database schema (entities, fields)      |
| `api-design.json`      | REST/GraphQL API contracts              |
| `auth-design.json`     | Auth strategy, flows, middleware        |
| `backend-design.json`  | Backend architecture, services          |
| `frontend-design.json` | Frontend pages, components, state       |
| `execution-plan.json`  | Phased implementation plan              |
| `express-config.json`  | Express.js routes/middleware (if REST)  |
| `apollo-config.json`   | Apollo subgraph config (if GraphQL)     |
| `react-config.json`    | React app config (if React selected)    |
| `nextjs-config.json`   | Next.js config (if Next.js selected)    |

## Using Output with Coding Agents

Hand the `output/` directory to your coding agent:

- **Cursor**: "Implement the backend using `output/backend-design.json` and `output/data-model.json`"
- **Claude Code**: Save as `CLAUDE.md` or reference with `@output/`
- **Codex**: Feed JSON specs as context

## Related

- [Quick Start](../quick-start/) -- Minimal import-and-run examples
- [Domain Agents](../../README.md#domain-agent-modules) -- Individual agent details
