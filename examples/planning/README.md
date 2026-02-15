# Planning Agent Example

4-stage pipeline producing implementation-ready markdown plans with 11 sections.

## Quick Start

```bash
npm install
cp .env.example .env          # add OPENAI_API_KEY
npm run example:planning       # interactive chat mode
```

## What It Does

Walks through **discovery -> requirements -> design -> synthesis** with 8+ sequential LLM calls. Produces a complete markdown implementation plan covering tech stack, data models, API routes, implementation order, edge cases, and testing checklists.

## Run

```bash
# Interactive chat -- describe your project, then say "continue" to advance stages
npm run example:planning

# One-shot -- provide requirement, get full plan
REQUIREMENT="Fitness app with workouts and nutrition" npm run example:planning

# Direct script
npm run example -- examples/planning/01-planning-agent.ts
```

## Inputs

| Variable         | Description                                  | Default       |
| ---------------- | -------------------------------------------- | ------------- |
| `OPENAI_API_KEY` | OpenAI API key                               | **required**  |
| `PROVIDER`       | AI provider                                  | `openai`      |
| `MODEL`          | Model name                                   | `gpt-4o-mini` |
| `REQUIREMENT`    | Project description (skips interactive chat) | --            |

## Output

Markdown plan with sections: Overview, Tech Stack, Feature Decisions, Data Models, Pages and Routes, Authentication Flow, API Routes, Implementation Details, Execution Plan, Edge Cases, Testing Checklist.

## Integration with Coding Agents

```typescript
import { runPlanningAgent } from 'sweagent';
import { writeFileSync } from 'fs';

const result = await runPlanningAgent({
  input: 'Task manager with teams, Kanban boards, and time tracking',
  model: { provider: 'openai', model: 'gpt-4o-mini' },
});
writeFileSync('plan.md', result.output);

// Cursor: "Implement @plan.md step by step"
// Claude Code: save as CLAUDE.md for automatic context
```

## Related

- [Requirement Gatherer](../requirement-gatherer/) -- Structured JSON requirements instead of markdown
- [Main README - Planning Pipeline](../../README.md#planning-pipeline) -- Architecture details
- [Domain Agents](../../README.md#domain-agents) -- All 14 agent pipelines
