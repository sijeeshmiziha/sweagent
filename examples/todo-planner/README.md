# Todo Planner Examples

Demonstrates the **todo-planner** agent module which decomposes any problem into a structured, dependency-aware todo plan.

## Examples

### 01 - Todo Planner Agent

Runs the full orchestrator pipeline:

1. **Problem Decomposer** subagent analyzes the problem into sub-problems and domains
2. **Dependency Resolver** subagent determines task ordering and critical path
3. **Create Todo Plan** tool generates the structured JSON plan
4. **Validate Todo Plan** tool checks the output against the schema

```bash
# Interactive mode
npx tsx --env-file=.env examples/todo-planner/01-todo-planner-agent.ts

# One-shot mode
REQUIREMENT="Add payment processing with Stripe" \
  npx tsx --env-file=.env examples/todo-planner/01-todo-planner-agent.ts
```

## Output Format

The agent produces a `TodoPlan` JSON with:

- **problem**: Original problem statement
- **analysis**: Problem breakdown reasoning
- **todos**: Array of tasks with id, title, description, priority, effort, category, dependencies, acceptance criteria, and affected files
- **executionOrder**: Topologically sorted task IDs
- **estimatedTotalEffort**: Overall effort estimate
- **risks**: Identified risks with mitigations

## When to Use

Use the todo-planner when you need:

- A step-by-step breakdown of a feature or bug fix
- Dependency-aware task ordering for a team
- Effort estimation for planning
- Risk identification before starting work

## Configuration

| Variable      | Default         | Description                             |
| ------------- | --------------- | --------------------------------------- |
| `PROVIDER`    | `openai`        | AI provider (openai, anthropic, google) |
| `MODEL`       | `gpt-4o-mini`   | Model name                              |
| `REQUIREMENT` | _(interactive)_ | Problem description                     |
| `LOG_LEVEL`   | `info`          | Log verbosity                           |
