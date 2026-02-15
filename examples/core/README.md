# Core Framework Examples

Foundation examples demonstrating the shared framework that all domain agents are built on.

## Quick Start

```bash
npm install
cp .env.example .env          # add OPENAI_API_KEY
npm run example:core           # interactive picker
```

## What It Does

Five progressive examples that build from a single model call to full sub-agent delegation. These are the building blocks used internally by every domain agent.

## Examples

| #   | Example        | Description                                            |
| --- | -------------- | ------------------------------------------------------ |
| 01  | Basic Model    | Single model invocation with OpenAI                    |
| 02  | All Providers  | Same prompt across OpenAI, Anthropic, and Google       |
| 03  | Tool Calling   | Agent with a calculator tool using Zod schemas         |
| 04  | Multiple Tools | Agent with search, file write, and calculator tools    |
| 05  | Subagents      | Parent agent with researcher and summarizer sub-agents |

## Run

```bash
# Interactive -- pick an example from the menu
npm run example:core

# Run a specific example directly
npm run example -- examples/core/01-basic-model.ts
npm run example -- examples/core/03-tool-calling.ts
npm run example -- examples/core/05-subagents.ts
```

## Inputs

| Variable                       | Description                                   | Default         |
| ------------------------------ | --------------------------------------------- | --------------- |
| `OPENAI_API_KEY`               | OpenAI API key                                | **required**    |
| `ANTHROPIC_API_KEY`            | Anthropic API key                             | required for 02 |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google API key                                | required for 02 |
| `PROVIDER`                     | AI provider (`openai`, `anthropic`, `google`) | `openai`        |
| `MODEL`                        | Model name                                    | `gpt-4o-mini`   |
| `PROMPT`                       | User prompt (01, 02)                          | varies          |
| `MAX_ITERATIONS`               | Max agent loop iterations (03-05)             | `5`-`10`        |

## Learning Path

```
01 Basic Model  -->  02 All Providers  -->  03 Tool Calling  -->  04 Multiple Tools  -->  05 Subagents
     model              providers              tool + Zod           tool set               delegation
```

Start with 01 to understand model invocation, then progress through tool calling and sub-agents.

## Related

- [Main README](../../README.md) -- Overview and installation
- [Hello World](../hello-world/) -- Minimal agent template
- [Domain Agents](../../README.md#domain-agents) -- Agents built on this foundation
