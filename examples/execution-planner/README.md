# Execution Planner Example

Creates phased implementation plans with edge cases, testing checklists, and security/performance notes.

## Quick Start

```bash
npm install
cp .env.example .env                  # add OPENAI_API_KEY
npm run example:execution-planner      # interactive prompts
```

## What It Does

Uses an orchestrator with `edge-case-analyzer` and `testing-strategist` sub-agents. Takes project requirements and produces a structured execution plan: ordered implementation phases, identified edge cases, a testing checklist, and security/performance considerations.

## Run

```bash
# Interactive -- prompts for project description
npm run example:execution-planner

# One-shot
REQUIREMENT="Task manager with Next.js, MongoDB, JWT auth" npm run example:execution-planner

# Direct script
npm run example -- examples/execution-planner/01-execution-planner-agent.ts
```

## Inputs

| Variable         | Description                        | Default       |
| ---------------- | ---------------------------------- | ------------- |
| `OPENAI_API_KEY` | OpenAI API key                     | **required**  |
| `PROVIDER`       | AI provider                        | `openai`      |
| `MODEL`          | Model name                         | `gpt-4o-mini` |
| `REQUIREMENT`    | Project description (skips prompt) | --            |

## Output

Execution plan JSON with phases, edge cases, testing checklist, and security/performance notes.

## Integration with Coding Agents

```typescript
import { runExecutionPlannerAgent } from 'sweagent';
import { writeFileSync } from 'fs';

const result = await runExecutionPlannerAgent({
  input: 'Task manager: Next.js, MongoDB, JWT auth, user/project/task CRUD',
  model: { provider: 'openai', model: 'gpt-4o-mini' },
});
writeFileSync('execution-plan.json', result.output);

// Cursor: "Implement Phase 1 from @execution-plan.json"
// Claude Code: "Read execution-plan.json and implement the first phase"
```

## Related

- [Planning Agent](../planning/) -- Full markdown plans (broader scope)
- [Backend Architect](../backend-architect/) -- Backend architecture design
- [Module Reference](../../src/modules/execution-planner/README.md) -- Full API docs
