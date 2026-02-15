# Todo Planner Module

Dependency-aware task decomposition agent that converts any problem into a structured, ordered todo plan.

## What It Does

Given a problem or task description, the todo-planner produces a **TodoPlan**: a dependency graph of concrete, actionable tasks that a coding agent can execute step by step.

## How It Differs

| Module              | Output                          | Purpose                                           |
| ------------------- | ------------------------------- | ------------------------------------------------- |
| `planning`          | Narrative markdown              | High-level implementation plan                    |
| `execution-planner` | Phased JSON                     | Implementation phases with edge cases             |
| **`todo-planner`**  | **Dependency-aware todo graph** | **Step-by-step tasks a coding agent can execute** |

## Architecture

```
Input (problem) → Orchestrator
  ├─ subagent: problem-decomposer → sub-problems, domains, risks
  ├─ subagent: dependency-resolver → task ordering, critical path
  ├─ tool: create_todo_plan → structured TodoPlan JSON
  └─ tool: validate_todo_plan → schema validation
```

## Output Schema

Each todo item includes:

- `id`, `title`, `description` - What to do
- `priority` (critical/high/medium/low) - How important
- `effort` (trivial/small/medium/large) - How long
- `category` (setup/data/api/auth/frontend/backend/testing/devops/documentation)
- `dependsOn` - Which tasks must finish first
- `acceptanceCriteria` - How to verify completion
- `filesLikelyAffected` - Which files to touch
- `status` (pending/in_progress/done/blocked) - Current state

## Usage

```typescript
import { runTodoPlannerAgent } from 'sweagent';

const result = await runTodoPlannerAgent({
  input: 'Add user authentication with JWT tokens and role-based access control',
  model: { provider: 'openai', model: 'gpt-4o-mini' },
});

console.log(result.output); // TodoPlan JSON
```
