# Quick Start Examples

Minimal import-and-run examples for getting started with sweagent.

## Examples

### 01 - One-Shot Plan

Get a full implementation plan with a single function call. The simplest way to use sweagent.

```bash
npx tsx --env-file=.env examples/quick-start/01-one-shot-plan.ts
REQUIREMENT="Fitness app" npx tsx --env-file=.env examples/quick-start/01-one-shot-plan.ts
```

### 02 - Requirements -> Plan

Chain two agents: gather structured requirements, then generate a plan using the fast path.

```bash
npx tsx --env-file=.env examples/quick-start/02-requirements-then-plan.ts
```

### 03 - Custom Agent

Build your own agent from scratch using `createModel`, `defineTool`, `createToolSet`, and `runAgent`.

```bash
npx tsx --env-file=.env examples/quick-start/03-custom-agent.ts
```

## Related

- [Full Pipeline](../full-pipeline/) -- Chain all domain agents end-to-end
- [Core Framework](../core/) -- Progressive foundation examples
- [Domain Agents](../../README.md#domain-agent-modules) -- Individual agent pipelines
