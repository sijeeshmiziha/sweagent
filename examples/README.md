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
- [Using sweagent with Coding Agents](#using-sweagent-with-coding-agents)
- [Usage in Your Project](#usage-in-your-project)
- [How to Run](#how-to-run)
- [Domain Agent Examples](#domain-agent-examples)
  - [Planning Agent](#planning-agent)
  - [Requirement Gatherer Agent](#requirement-gatherer-agent)
  - [Data Modeler Agent](#data-modeler-agent)
  - [DB Designer Agent](#db-designer-agent)
  - [API Designer Agent](#api-designer-agent)
  - [Auth Designer Agent](#auth-designer-agent)
  - [Backend Architect Agent](#backend-architect-agent)
  - [Express Builder Agent](#express-builder-agent)
  - [Apollo Builder Agent](#apollo-builder-agent)
  - [Frontend Architect Agent](#frontend-architect-agent)
  - [React Builder Agent](#react-builder-agent)
  - [Next.js Builder Agent](#nextjs-builder-agent)
  - [Execution Planner Agent](#execution-planner-agent)
- [Core Framework Examples](#core-framework-examples)
- [Hello World (Template)](#hello-world-template)
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

Each example file includes a **Setup** and **Run** block in its header showing the exact env vars and how to run it with `npx tsx`.

---

## How to Run

### Interactive launcher (recommended)

Pick a domain agent (Planning, Requirement Gatherer, DB Designer, React Builder) or a framework example (Core, Hello World), then run it. You'll be prompted for any inputs:

```bash
npm run example:interactive
```

### Run a specific example

```bash
npm run example -- examples/planning/01-planning-agent.ts
npm run example -- examples/requirement-gatherer/01-requirement-gatherer-agent.ts
npm run example -- examples/core/01-basic-model.ts
npm run example -- examples/hello-world/01-hello-world.ts
```

Always run from the **project root** so that `--env-file=.env` and module resolution work.

---

## Domain Agent Examples

Each domain agent is a complete pipeline with its own orchestrator, stages, sub-agents, and structured output. These examples demonstrate enterprise-quality planning outputs.

---

### Planning Agent

| Example             | Path                                     | Description                                                                                                                     |
| ------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 01 - Planning Agent | `examples/planning/01-planning-agent.ts` | 4-stage pipeline (discovery, requirements, design, synthesis) producing an implementation-ready markdown plan with 11 sections. |

**Pipeline:** Discovery --> Requirements (4 LLM calls) --> Design (2 LLM calls) --> Synthesis --> LLM Validation

**Env vars**: `PROVIDER`, `MODEL`, `REQUIREMENT` (leave empty for interactive chat mode).

**Run**:

```bash
# Interactive chat mode -- walk through stages with the agent
npm run example:planning

# One-shot mode -- provide requirement, get full plan
REQUIREMENT="Fitness app with workouts and nutrition" npm run example:planning
```

**Required**: `OPENAI_API_KEY` (or another provider key with `PROVIDER` set).

**How it works**: The planning agent uses `processPlanningChat` for multi-turn interaction or `runPlanningAgent` for one-shot mode. It progresses through four stages with 8+ sequential LLM calls, producing a full markdown implementation plan covering tech stack, data models, API routes, implementation order, edge cases, and testing checklist.

**Output**: Markdown plan with sections: Overview, Tech Stack, Feature Decisions, Data Models, Pages and Routes, Authentication Flow, API Routes, Implementation Details, Execution Plan, Edge Cases, Testing Checklist.

**Related**: [Main README - Planning Pipeline](../README.md#planning-pipeline) | [Domain Agents](../README.md#domain-agents)

---

### Requirement Gatherer Agent

| Example                         | Path                                                             | Description                                                                                                          |
| ------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| 01 - Requirement Gatherer Agent | `examples/requirement-gatherer/01-requirement-gatherer-agent.ts` | Multi-stage pipeline producing structured JSON requirements with actors, user flows, stories, and module breakdowns. |

**Pipeline:** Discovery --> Requirements --> Design --> Synthesis

**Env vars**: `PROVIDER`, `MODEL`.

**Run**:

```bash
npm run example:requirement-gatherer
```

**Required**: `OPENAI_API_KEY` (or another provider key with `PROVIDER` set).

**How it works**: Unlike the Planning module (markdown output), the Requirement Gatherer produces structured JSON data that downstream systems can consume programmatically. It walks through discovery, requirements, design, and synthesis stages to extract typed data.

**Output**: Structured JSON with Actors (with permissions), User Flows (step-by-step sequences), User Stories (with acceptance criteria), Modules (with CRUD operations), Database Design (schemas, relationships), API Design (REST/GraphQL endpoints).

**Related**: [Planning Agent](#planning-agent) for markdown-based planning | [Domain Agents](../README.md#domain-agents)

---

### DB Designer Agent

| Example                | Path                                           | Description                                                                                                                |
| ---------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| 01 - DB Designer Agent | `examples/db-designer/01-db-designer-agent.ts` | Orchestrator agent with `entity-analyzer` and `schema-refiner` sub-agents producing MongoDB schemas from natural language. |

**Pattern:** Orchestrator --> Sub-Agents (`entity-analyzer`, `schema-refiner`) --> Tools (`design_database`, `validate_schema`)

**Env vars**: `PROVIDER`, `MODEL`, `AGENT_INPUT` (or `REQUIREMENT`), `MAX_ITERATIONS`.

**Run**: `npm run example -- examples/db-designer/01-db-designer-agent.ts`

**Required**: `OPENAI_API_KEY`.

**How it works**: The orchestrator agent receives a natural-language requirement and delegates to the `entity-analyzer` sub-agent to extract entities and relationships, then to the `schema-refiner` sub-agent to normalize and validate the schema. Tools like `design_database` and `validate_schema` handle the heavy lifting.

**Output**: MongoDB project schema (modules, fields, relationships, indexes, validation rules) as JSON.

**Related**: [React Builder Agent](#react-builder-agent) for another orchestrator pattern | [Domain Agents](../README.md#domain-agents)

---

### React Builder Agent

| Example                  | Path                                               | Description                                                                                                                         |
| ------------------------ | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 01 - React Builder Agent | `examples/react-builder/01-react-builder-agent.ts` | Orchestrator agent with `graphql-analyzer` and `config-validator` sub-agents producing frontend configuration from GraphQL schemas. |

**Pattern:** Orchestrator --> Sub-Agents (`graphql-analyzer`, `config-validator`) --> Tools (`generate_frontend`, `validate_frontend_config`)

**Env vars**: `PROVIDER`, `MODEL`, `AGENT_INPUT` (or `GRAPHQL_SCHEMA`), `MAX_ITERATIONS`.

**Run**: `npm run example -- examples/react-builder/01-react-builder-agent.ts`

**Required**: `OPENAI_API_KEY`.

**How it works**: The orchestrator agent receives a GraphQL schema and delegates to the `graphql-analyzer` sub-agent to parse the schema structure, then uses `generate_frontend` to produce the config. The `config-validator` sub-agent verifies the output against frontend config schemas.

**Output**: React app config JSON (app, modules, pages, fields, API hooks, branding).

**Related**: [DB Designer Agent](#db-designer-agent) for another orchestrator pattern | [Domain Agents](../README.md#domain-agents)

---

### Data Modeler Agent

| Example                 | Path                                             | Description                                                                                        |
| ----------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| 01 - Data Modeler Agent | `examples/data-modeler/01-data-modeler-agent.ts` | Designs MongoDB/PostgreSQL data models with entity analysis, relationship mapping, and refinement. |

**Pattern:** Orchestrator --> Sub-Agents (`entity-analyzer`, `relationship-mapper`, `schema-refiner`) --> Tools (`design_schema`, `validate_data_model`)

**Run**: `npm run example -- examples/data-modeler/01-data-modeler-agent.ts`

**Output**: Data model JSON with entities, fields, indexes, and relationships. Feed this to your coding agent to implement Prisma or Mongoose models.

---

### API Designer Agent

| Example                 | Path                                             | Description                                                               |
| ----------------------- | ------------------------------------------------ | ------------------------------------------------------------------------- |
| 01 - API Designer Agent | `examples/api-designer/01-api-designer-agent.ts` | Designs REST and/or GraphQL APIs with endpoint definitions and contracts. |

**Pattern:** Orchestrator --> Sub-Agents (`endpoint-analyzer`, `contract-designer`) --> Tools (`design_api`, `validate_api`)

**Run**: `npm run example -- examples/api-designer/01-api-designer-agent.ts`

**Output**: API design JSON with REST endpoints and/or GraphQL operations, request/response contracts, and auth requirements.

---

### Auth Designer Agent

| Example                  | Path                                               | Description                                                                     |
| ------------------------ | -------------------------------------------------- | ------------------------------------------------------------------------------- |
| 01 - Auth Designer Agent | `examples/auth-designer/01-auth-designer-agent.ts` | Designs auth systems with strategies, flows, middleware, and role-based access. |

**Pattern:** Orchestrator --> Sub-Agents (`security-analyzer`, `flow-designer`) --> Tools (`design_auth`, `validate_auth`)

**Run**: `npm run example -- examples/auth-designer/01-auth-designer-agent.ts`

**Output**: Auth design JSON with strategy, flows (signup, login, password reset), middleware, roles, and security policies.

---

### Backend Architect Agent

| Example                      | Path                                                       | Description                                                             |
| ---------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------- |
| 01 - Backend Architect Agent | `examples/backend-architect/01-backend-architect-agent.ts` | Plans backend architecture with framework selection and service design. |

**Pattern:** Orchestrator --> Sub-Agents (`framework-selector`, `service-planner`) --> Tools (`design_backend`, `validate_backend`)

**Run**: `npm run example -- examples/backend-architect/01-backend-architect-agent.ts`

**Output**: Backend design JSON with framework choice, services, middleware, routes, and folder structure.

---

### Express Builder Agent

| Example                    | Path                                                   | Description                                                              |
| -------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------ |
| 01 - Express Builder Agent | `examples/express-builder/01-express-builder-agent.ts` | Generates Express.js REST API configuration with routers and middleware. |

**Pattern:** Orchestrator --> Sub-Agents (`route-generator`, `middleware-configurator`) --> Tools (`generate_express`, `validate_express`)

**Run**: `npm run example -- examples/express-builder/01-express-builder-agent.ts`

**Output**: Express config JSON with routers, models, middleware, and env vars.

---

### Apollo Builder Agent

| Example                   | Path                                                 | Description                                            |
| ------------------------- | ---------------------------------------------------- | ------------------------------------------------------ |
| 01 - Apollo Builder Agent | `examples/apollo-builder/01-apollo-builder-agent.ts` | Generates Apollo Federation v2 subgraph configuration. |

**Pattern:** Orchestrator --> Sub-Agents (`schema-generator`, `resolver-planner`) --> Tools (`generate_subgraph`, `validate_subgraph`)

**Run**: `npm run example -- examples/apollo-builder/01-apollo-builder-agent.ts`

**Output**: Subgraph config JSON with modules, GraphQL types, resolver operations, and datasources.

---

### Frontend Architect Agent

| Example                       | Path                                                         | Description                                                      |
| ----------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------- |
| 01 - Frontend Architect Agent | `examples/frontend-architect/01-frontend-architect-agent.ts` | Plans frontend architecture with pages, components, and routing. |

**Pattern:** Orchestrator --> Sub-Agents (`page-planner`, `component-analyzer`, `framework-selector`)

**Run**: `npm run example -- examples/frontend-architect/01-frontend-architect-agent.ts`

**Output**: Frontend design JSON with pages, reusable components, state management, and routing strategy.

---

### Next.js Builder Agent

| Example                    | Path                                                 | Description                                 |
| -------------------------- | ---------------------------------------------------- | ------------------------------------------- |
| 01 - Next.js Builder Agent | `examples/nextjs-builder/01-nextjs-builder-agent.ts` | Generates Next.js App Router configuration. |

**Pattern:** Orchestrator --> Sub-Agents (`route-planner`, `api-route-generator`) --> Tools (`generate_nextjs`, `validate_nextjs`)

**Run**: `npm run example -- examples/nextjs-builder/01-nextjs-builder-agent.ts`

**Output**: Next.js config JSON with pages, layouts, API routes, server actions, and middleware.

---

### Execution Planner Agent

| Example                      | Path                                                       | Description                                                                 |
| ---------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------- |
| 01 - Execution Planner Agent | `examples/execution-planner/01-execution-planner-agent.ts` | Creates phased implementation plans with edge cases and testing checklists. |

**Pattern:** Orchestrator --> Sub-Agents (`edge-case-analyzer`, `testing-strategist`) --> Tools (`create_execution_plan`, `validate_execution_plan`)

**Run**: `npm run example -- examples/execution-planner/01-execution-planner-agent.ts`

**Output**: Execution plan JSON with phases, edge cases, testing checklist, and security/performance notes.

---

## Core Framework Examples

These examples demonstrate the shared framework that all domain agents are built on: models, tools, agent loops, and sub-agent delegation.

| Example                        | Path                                            | Description                                                               |
| ------------------------------ | ----------------------------------------------- | ------------------------------------------------------------------------- |
| 01 - Basic Model               | `examples/core/01-basic-model.ts`               | Simple model invocation (OpenAI).                                         |
| 02 - All Providers             | `examples/core/02-all-providers.ts`             | Same prompt with OpenAI, Anthropic, and Google -- provider-agnostic API.  |
| 03 - Tool Calling              | `examples/core/03-tool-calling.ts`              | Agent with a calculator tool (Zod schema, validated input).               |
| 04 - Agent with Multiple Tools | `examples/core/04-agent-with-multiple-tools.ts` | Agent with search, file write, and calculator tools -- minimal tool sets. |
| 05 - Subagents                 | `examples/core/05-subagents.ts`                 | Parent agent delegating to researcher and summarizer sub-agents.          |

**Required**: `OPENAI_API_KEY`. For 02, also `ANTHROPIC_API_KEY` and `GOOGLE_GENERATIVE_AI_API_KEY`.

These examples build progressively: model invocation --> tool definition --> agent loop --> sub-agent delegation. This is the same foundation that domain agents use internally.

---

## Hello World (Template)

| Example          | Path                                     | Description                                                                                            |
| ---------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| 01 - Hello World | `examples/hello-world/01-hello-world.ts` | Minimal agent with a greeting tool. Use as a starting point for building your own domain agent module. |

**Required**: `OPENAI_API_KEY`.

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
- [Planning Pipeline](../README.md#planning-pipeline) -- 4-stage planning pipeline for coding agents
- [Getting Started](../README.md#getting-started) -- Step-by-step from model to agent to planning
- [API Reference](../README.md#api-reference) -- Models, tools, agents, sub-agents, planning, MCP
- [Domain Agent Modules](../README.md#domain-agent-modules) -- Detailed module reference for each domain agent
- [Contributing Guide](../CONTRIBUTING.md) -- How to contribute

<p align="center">
  <a href="../README.md">Back to Main README</a>
</p>
