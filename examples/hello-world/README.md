# Hello World Example

Minimal agent with a greeting tool. Use as a starting point for building your own domain agent module.

## Quick Start

```bash
npm install
cp .env.example .env          # add OPENAI_API_KEY
npm run example:hello-world    # run directly
```

## What It Does

Creates a simple agent with one tool (`hello_world`) that greets people by name. Demonstrates the complete agent lifecycle: model creation, tool definition, agent loop, step callbacks, and usage tracking.

## Run

```bash
# Via module entry point
npm run example:hello-world

# Via the example script directly
npm run example -- examples/hello-world/01-hello-world.ts

# With custom inputs
PROMPT="Greet Alice, Bob, and Charlie" npm run example:hello-world
```

## Inputs

| Variable         | Description               | Default                         |
| ---------------- | ------------------------- | ------------------------------- |
| `OPENAI_API_KEY` | OpenAI API key            | **required**                    |
| `PROVIDER`       | AI provider               | `openai`                        |
| `MODEL`          | Model name                | `gpt-4o-mini`                   |
| `PROMPT`         | Who to greet              | `Greet Alice and Bob.`          |
| `SYSTEM_PROMPT`  | Agent instructions        | `You are a friendly greeter...` |
| `MAX_ITERATIONS` | Max agent loop iterations | `5`                             |

## Output

The agent calls the `hello_world` tool for each person mentioned, then returns a summary:

```
--- Hello World Output ---
I've greeted Alice and Bob! Alice received a warm hello, and Bob got a cheerful greeting too.

Steps: 2
Tokens: input=342 output=89
```

## Use as Template

Copy this example and modify it to build your own agent:

1. Replace the `hello_world` tool with your domain-specific tools
2. Update the system prompt for your use case
3. Add sub-agents if needed (see [Core 05 - Subagents](../core/))

## Related

- [Core Framework Examples](../core/) -- Progressive foundation examples
- [Domain Agents](../../README.md#domain-agents) -- Full domain agent pipelines
- [API Reference](../../README.md#api-reference) -- `runAgent`, `defineTool`, `createModel`
