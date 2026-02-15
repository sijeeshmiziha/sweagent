# Requirement Gatherer Example

Multi-stage pipeline producing structured JSON requirements with actors, user flows, stories, and module breakdowns.

## Quick Start

```bash
npm install
cp .env.example .env                      # add OPENAI_API_KEY
npm run example:requirement-gatherer       # interactive chat mode
```

## What It Does

Walks through **discovery -> requirements -> design -> complete** stages. Unlike the Planning Agent (markdown output), the Requirement Gatherer produces structured JSON data that downstream agents can consume programmatically: actors, user flows, user stories, modules, database design, and API design.

## Run

```bash
# Interactive chat -- describe your project, say "continue" to advance stages
npm run example:requirement-gatherer

# One-shot -- provide requirement, auto-advances through stages
REQUIREMENT="Task manager app with REST API" npm run example:requirement-gatherer

# Save output to file
SAVE_REQUIREMENT=1 npm run example:requirement-gatherer

# Direct script
npm run example -- examples/requirement-gatherer/01-requirement-gatherer-agent.ts
```

## Inputs

| Variable           | Description                                            | Default       |
| ------------------ | ------------------------------------------------------ | ------------- |
| `OPENAI_API_KEY`   | OpenAI API key                                         | **required**  |
| `PROVIDER`         | AI provider                                            | `openai`      |
| `MODEL`            | Model name                                             | `gpt-4o-mini` |
| `REQUIREMENT`      | Project description (skips interactive chat)           | --            |
| `SAVE_REQUIREMENT` | Set to `1` to save output as `requirement-output.json` | --            |

## Output

Structured JSON with actors (with permissions), user flows (step-by-step), user stories (with acceptance criteria), modules (with CRUD), database design (schemas, relationships), and API design (REST/GraphQL endpoints).

## How to Integrate

```typescript
import { processRequirementChat } from 'sweagent';
import type { RequirementContext } from 'sweagent';

let context: RequirementContext | null = null;

const result = await processRequirementChat(userMessage, context, {
  model: { provider: 'openai', model: 'gpt-4o-mini' },
});
context = result.context;
// Use result.message, result.questions, result.finalRequirement
```

## Pipeline Example

Feed the output into downstream agents:

```typescript
import { runRequirementGathererAgent, runDataModelerAgent } from 'sweagent';

const requirements = await runRequirementGathererAgent({
  input: 'Task manager with teams and Kanban boards',
  model: { provider: 'openai', model: 'gpt-4o-mini' },
});

const dataModel = await runDataModelerAgent({
  input: `Design data model from:\n${requirements.output}`,
  model: { provider: 'openai', model: 'gpt-4o-mini' },
});
```

## Integration with Coding Agents

```typescript
import { writeFileSync } from 'fs';

writeFileSync('requirements.json', requirements.output);

// Cursor: "Implement the project described in @requirements.json"
// Claude Code: "Read requirements.json and implement the user module first"
```

## Related

- [Planning Agent](../planning/) -- Markdown-based planning (broader scope)
- [Data Modeler](../data-modeler/) -- Design data models from requirements
- [API Designer](../api-designer/) -- Design APIs from requirements
- [Full Pipeline](../../README.md#full-pipeline) -- Complete agent chaining workflow
- [Module Reference](../../src/modules/requirement-gatherer/README.md) -- Full API docs
