# Examples

<p align="center">
  <strong>Runnable examples</strong> demonstrating sweagent's capabilities — models, tools, and agents.
</p>

<p align="center">
  <a href="../README.md">← Main README</a> •
  <a href="../README.md#getting-started-tutorial">Tutorial</a> •
  <a href="../README.md#api-reference">API Reference</a> •
  <a href="../CONTRIBUTING.md">Contributing</a>
</p>

---

This directory contains copy-pasteable scripts you can run from the project root or adapt for your own project. Each example documents required env vars and how to run it.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Usage in Your Project](#usage-in-your-project)
- [How to Run](#how-to-run)
- [Available Examples](#available-examples)
  - [Core](#core)
  - [Hello World](#hello-world)
  - [DB Designer](#db-designer)
  - [React Builder](#react-builder)
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

## Usage in Your Project

All examples are written so you can copy them into an external project. They import from the package name and use environment variables for configuration.

### Install and import

```bash
npm install sweagent
```

```typescript
import { createModel, runAgent, defineTool } from 'sweagent';
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
  model: 'gpt-4o-mini', // e.g. gpt-4o, claude-3-haiku-20240307, gemini-1.5-flash
  apiKey: process.env.OPENAI_API_KEY,
  temperature: 0.7, // optional
});
```

Each example file includes a **Setup** and **Run** block in its header showing the exact env vars and how to run it with `npx tsx`.

---

## How to Run

### Interactive launcher (recommended)

Pick a folder (Core, Hello World, DB Designer, React Builder), then an example. You'll be prompted for any inputs (prompt, agent input, etc.):

```bash
npm run example:interactive
```

### Run a specific example

```bash
npm run example -- examples/core/01-basic-model.ts
npm run example -- examples/hello-world/01-hello-world.ts
```

Always run from the **project root** so that `--env-file=.env` and module resolution work.

---

## Available Examples

### Core

| Example                        | Path                                            | Description                                                     |
| ------------------------------ | ----------------------------------------------- | --------------------------------------------------------------- |
| 01 - Basic Model               | `examples/core/01-basic-model.ts`               | Simple model invocation (OpenAI).                               |
| 02 - All Providers             | `examples/core/02-all-providers.ts`             | Same prompt with OpenAI, Anthropic, and Google.                 |
| 03 - Tool Calling              | `examples/core/03-tool-calling.ts`              | Agent with a calculator tool.                                   |
| 04 - Agent with Multiple Tools | `examples/core/04-agent-with-multiple-tools.ts` | Agent with search, file write, and calculator tools.            |
| 05 - Subagents                 | `examples/core/05-subagents.ts`                 | Parent agent delegating to researcher and summarizer subagents. |

**Required**: `OPENAI_API_KEY`. For 02, also `ANTHROPIC_API_KEY` and `GOOGLE_GENERATIVE_AI_API_KEY`.

**Example output** (01 - Basic Model): A one-sentence explanation of TypeScript from the model, e.g. `"TypeScript is a typed superset of JavaScript that compiles to plain JavaScript."`

**Related**: [03 - Tool Calling](core/03-tool-calling.ts) builds on the model with a single tool; [04 - Agent with Multiple Tools](core/04-agent-with-multiple-tools.ts) shows a full multi-tool agent.

---

### Hello World

| Example          | Path                                     | Description                         |
| ---------------- | ---------------------------------------- | ----------------------------------- |
| 01 - Hello World | `examples/hello-world/01-hello-world.ts` | Minimal agent with a greeting tool. |

**Required**: `OPENAI_API_KEY`.

**Example output**: The agent uses the greeting tool and returns a friendly message, e.g. `"Hello, World!"` or a custom name you provide.

**Related**: [Core 03 - Tool Calling](core/03-tool-calling.ts) for a calculator tool; [Core 04 - Agent with Multiple Tools](core/04-agent-with-multiple-tools.ts) for a richer agent.

---

### DB Designer

| Example                | Path                                           | Description                                                                                                                                                 |
| ---------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 01 - DB Designer Agent | `examples/db-designer/01-db-designer-agent.ts` | Runs the db-designer orchestrator agent to generate a MongoDB schema from natural language requirements. Uses entity-analyzer and schema-refiner subagents. |

**Env vars**: `PROVIDER`, `MODEL`, `AGENT_INPUT` (or `REQUIREMENT`), `MAX_ITERATIONS`.

**Run**: `npx tsx examples/db-designer/01-db-designer-agent.ts` (from project root).

**Required**: `OPENAI_API_KEY`.

**Example output**: The agent produces a MongoDB project schema (modules, fields, relationships) as JSON or text based on your requirement (e.g. "E-commerce: users, orders, products...").

---

### React Builder

| Example                  | Path                                               | Description                                                                                                                                                    |
| ------------------------ | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 01 - React Builder Agent | `examples/react-builder/01-react-builder-agent.ts` | Runs the react-builder orchestrator agent to generate frontend configuration JSON from a GraphQL schema. Uses graphql-analyzer and config-validator subagents. |

**Env vars**: `PROVIDER`, `MODEL`, `AGENT_INPUT` (or `GRAPHQL_SCHEMA`), `MAX_ITERATIONS`.

**Run**: `npx tsx examples/react-builder/01-react-builder-agent.ts` (from project root).

**Required**: `OPENAI_API_KEY`.

**Example output**: The agent produces a frontend app config (app, modules, pages, fields, API hooks) as JSON based on your GraphQL schema.

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

- [Main README](../README.md) – Overview, installation, and full documentation
- [Getting Started Tutorial](../README.md#getting-started-tutorial) – Step-by-step from model to agent to subagents
- [API Reference](../README.md#api-reference) – Models, tools, agents, subagents, MCP
- [Production Modules](../README.md#production-modules) – DB Designer and React Builder
- [Contributing Guide](../CONTRIBUTING.md) – How to contribute

<p align="center">
  <a href="../README.md">Back to Main README</a>
</p>

<p align="center">
  Made with ❤️ by the CompilersLab team!
</p>
