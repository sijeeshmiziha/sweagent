# Examples

<p align="center">
  <strong>Runnable examples for all 14 domain agents</strong> -- planning, requirements, data modeling, API design, auth, backend, frontend, and more. Generate specs, then hand them to Cursor, Claude Code, or Codex.
</p>

<p align="center">
  <a href="../README.md">← Main README</a> •
  <a href="../README.md#domain-agents">Domain Agents</a> •
  <a href="../README.md#api-reference">API Reference</a> •
  <a href="../CONTRIBUTING.md">Contributing</a>
</p>

---

Each example demonstrates a domain-specialized agent pipeline. Domain agents walk through structured stages (discovery, requirements, design, synthesis) and produce enterprise-quality outputs -- not single-shot LLM calls. Copy-paste these scripts or adapt them for your own project.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [How to Run](#how-to-run)
- [Module Index](#module-index)
- [Using sweagent with Coding Agents](#using-sweagent-with-coding-agents)
- [Usage in Your Project](#usage-in-your-project)
- [Architecture](#architecture)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements

| Requirement | Version   |
| ----------- | --------- |
| Node.js     | >= 18.0.0 |
| npm         | >= 8.0.0  |

### API Keys

Set these in a `.env` file at the project root (copy from `.env.example`).

| Purpose   | Environment Variable           | Required For                   |
| --------- | ------------------------------ | ------------------------------ |
| OpenAI    | `OPENAI_API_KEY`               | Core, Hello World, most agents |
| Anthropic | `ANTHROPIC_API_KEY`            | Core (02 All Providers)        |
| Google    | `GOOGLE_GENERATIVE_AI_API_KEY` | Core (02 All Providers)        |

---

## Quick Start

**In this repo (development):**

```bash
# From the project root
npm install
cp .env.example .env
# Edit .env and add at least OPENAI_API_KEY
```

**In your own project (using the published package):**

```bash
npm install sweagent
# Set API keys in .env or export them (see Usage in Your Project below)
```

---

## How to Run

### Interactive launcher (recommended)

Pick any module from the menu. Each module has domain-specific prompts:

```bash
npm run example:interactive
```

### Run a specific module directly

Every module folder has an `index.ts` that can be run standalone:

```bash
npm run example:planning
npm run example:data-modeler
npm run example:api-designer
npm run example:express-builder
# ... see Module Index below for all commands
```

### One-shot mode (CI / scripting)

Set `REQUIREMENT` to skip interactive prompts:

```bash
REQUIREMENT="Fitness app with workouts and nutrition" npm run example:planning
REQUIREMENT="E-commerce with users, products, orders" npm run example:data-modeler
```

### Run a specific example script

```bash
npm run example -- examples/core/01-basic-model.ts
npm run example -- examples/planning/01-planning-agent.ts
```

Always run from the **project root** so that `--env-file=.env` and module resolution work.

---

## Module Index

Each module folder contains an `index.ts` (entry point), example scripts, and a `README.md` with full documentation.

| Module                                        | Command                                | Description                                              | README                                   |
| --------------------------------------------- | -------------------------------------- | -------------------------------------------------------- | ---------------------------------------- |
| [Core Framework](core/)                       | `npm run example:core`                 | Model calls, tools, agent loops, sub-agents              | [README](core/README.md)                 |
| [Hello World](hello-world/)                   | `npm run example:hello-world`          | Minimal agent template with greeting tool                | [README](hello-world/README.md)          |
| [Planning Agent](planning/)                   | `npm run example:planning`             | 4-stage pipeline producing markdown plans                | [README](planning/README.md)             |
| [Requirement Gatherer](requirement-gatherer/) | `npm run example:requirement-gatherer` | Structured JSON requirements with actors, flows, stories | [README](requirement-gatherer/README.md) |
| [Data Modeler](data-modeler/)                 | `npm run example:data-modeler`         | MongoDB/PostgreSQL data models                           | [README](data-modeler/README.md)         |
| [DB Designer](db-designer/)                   | `npm run example:db-designer`          | MongoDB schemas with sub-agent orchestration             | [README](db-designer/README.md)          |
| [API Designer](api-designer/)                 | `npm run example:api-designer`         | REST or GraphQL API designs                              | [README](api-designer/README.md)         |
| [Auth Designer](auth-designer/)               | `npm run example:auth-designer`        | Auth flows, middleware, RBAC, security policies          | [README](auth-designer/README.md)        |
| [Backend Architect](backend-architect/)       | `npm run example:backend-architect`    | Backend architecture with framework selection            | [README](backend-architect/README.md)    |
| [Express Builder](express-builder/)           | `npm run example:express-builder`      | Express.js REST API configurations                       | [README](express-builder/README.md)      |
| [Apollo Builder](apollo-builder/)             | `npm run example:apollo-builder`       | Apollo Federation v2 subgraph configs                    | [README](apollo-builder/README.md)       |
| [Frontend Architect](frontend-architect/)     | `npm run example:frontend-architect`   | Frontend pages, components, routing, state               | [README](frontend-architect/README.md)   |
| [React Builder](react-builder/)               | `npm run example:react-builder`        | React app config from GraphQL schemas                    | [README](react-builder/README.md)        |
| [Next.js Builder](nextjs-builder/)            | `npm run example:nextjs-builder`       | Next.js App Router configurations                        | [README](nextjs-builder/README.md)       |
| [Execution Planner](execution-planner/)       | `npm run example:execution-planner`    | Phased implementation plans                              | [README](execution-planner/README.md)    |

---

## Using sweagent with Coding Agents

The primary use case for sweagent is generating structured specs that make Cursor, Claude Code, and Codex dramatically more effective. Here's the typical workflow:

1. **Generate specs** -- Run one or more sweagent agents to produce plans, requirements, schemas, or configs
2. **Save to files** -- Write the outputs to your project directory
3. **Hand to your coding agent** -- Reference the spec files in Cursor chat, Claude Code's CLAUDE.md, or Codex context

```typescript
import { runPlanningWithResult } from 'sweagent';
import { writeFileSync } from 'fs';

// Generate a plan
const { plan } = await runPlanningWithResult({
  input: 'Task manager with teams, Kanban boards, and time tracking',
  model: { provider: 'openai', model: 'gpt-4o-mini' },
});
writeFileSync('plan.md', plan);

// Cursor: "Implement @plan.md step by step"
// Claude Code: save as CLAUDE.md for automatic context
// Codex: reference plan.md in your prompt
```

See the [main README](../README.md#use-with-cursor-claude-code-and-codex) for detailed integration guides for each coding agent.

---

## Usage in Your Project

All examples are written so you can copy them into an external project. They import from the package name and use environment variables for configuration.

### Install and import

```bash
npm install sweagent
```

```typescript
import { createModel, runAgent, defineTool } from 'sweagent';
import { runPlanningWithResult, processPlanningChat } from 'sweagent';
```

### API keys

Pass keys via **environment variables** (recommended) or explicitly in config:

| Service   | Env variable                   | Example in code                                                                                 |
| --------- | ------------------------------ | ----------------------------------------------------------------------------------------------- |
| OpenAI    | `OPENAI_API_KEY`               | `createModel({ provider: 'openai', model: 'gpt-4o-mini', apiKey: process.env.OPENAI_API_KEY })` |
| Anthropic | `ANTHROPIC_API_KEY`            | Same pattern with `provider: 'anthropic'`                                                       |
| Google    | `GOOGLE_GENERATIVE_AI_API_KEY` | Same pattern with `provider: 'google'`                                                          |

### Model selection

```typescript
const model = createModel({
  provider: 'openai', // 'openai' | 'anthropic' | 'google'
  model: 'gpt-4o-mini', // e.g. gpt-4o, claude-sonnet-4-20250514, gemini-1.5-flash
  apiKey: process.env.OPENAI_API_KEY,
  temperature: 0.7, // optional
});
```

---

## Architecture

Each module folder follows the same structure:

```
examples/{module-name}/
  index.ts           # Module entry point -- metadata + run() function
  01-*.ts            # Example script(s)
  README.md          # Module-specific documentation
```

The interactive launcher (`run.ts`) uses a registry that imports all module `index.ts` files:

```
run.ts  -->  lib/registry.ts  -->  planning/index.ts
                                   data-modeler/index.ts
                                   api-designer/index.ts
                                   ... (15 modules total)
```

Each module's `index.ts` can also be run standalone (`npx tsx --env-file=.env examples/{module}/index.ts`).

---

## Troubleshooting

### "Missing API key" Error

Ensure `.env` exists in the project root and contains the needed keys (e.g. `OPENAI_API_KEY`). Run from the project root so `npm run example` / `example:interactive` load `.env`.

### "Module not found" Error

Run from the **project root**, not from inside `examples/`:

```bash
# Wrong
cd examples && npx tsx core/01-basic-model.ts

# Correct
npm run example -- examples/core/01-basic-model.ts
```

### "Model not available" Error

Confirm your API key has access to the model (e.g. `gpt-4o-mini`). Some models require a paid or higher tier.

### Timeout errors

For long-running agent calls, the default timeout may be too low. Increase timeouts in your code or environment if your provider allows.

---

## Next Steps

- [Main README](../README.md) -- Overview, installation, and full documentation
- [Use with Coding Agents](../README.md#use-with-cursor-claude-code-and-codex) -- Cursor, Claude Code, and Codex integration guides
- [Domain Agents](../README.md#domain-agents) -- All 14 domain agent pipelines with architecture diagrams
- [Full Pipeline](../README.md#full-pipeline) -- Chain agents together for end-to-end planning
- [API Reference](../README.md#api-reference) -- Models, tools, agents, sub-agents, planning, MCP
- [Contributing Guide](../CONTRIBUTING.md) -- How to contribute

<p align="center">
  <a href="../README.md">Back to Main README</a>
</p>
