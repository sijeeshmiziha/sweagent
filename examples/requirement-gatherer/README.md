# Requirement Gatherer Example

Interactive multi-turn chat that gathers project requirements and produces a final requirement document (database + API design).

## How to run

- **Interactive (chat):** Leave `REQUIREMENT` unset. You'll be prompted for each message; say "continue" to advance stages.
  ```bash
  npm run example:requirement-gatherer
  # or
  npx tsx --env-file=.env examples/requirement-gatherer/01-requirement-gatherer-agent.ts
  ```
- **One-shot:** Set `REQUIREMENT` (or `AGENT_INPUT`) to a short project description. The example runs that input then auto-advances with "continue" for up to 10 turns.
  ```bash
  REQUIREMENT="Task manager app with REST API" npm run example:requirement-gatherer
  ```
- **Save output:** Set `SAVE_REQUIREMENT=1` to write the final requirement JSON to `requirement-output.json` in the current directory.
  ```bash
  SAVE_REQUIREMENT=1 npm run example:requirement-gatherer
  ```

Env: `OPENAI_API_KEY` (or provider-specific key), optional `PROVIDER`, `MODEL`.

## How to integrate in your app

1. Call `processRequirementChat(userMessage, context, config)` for each user turn.
2. Persist `result.context` between turns and pass it as the second argument on the next call.
3. Show `result.message` to the user; if `result.questions?.length`, present them and use the user's answers in the next message.
4. When `result.finalRequirement` is set, the flow is complete; use that object (e.g. database + API design).

```ts
import { processRequirementChat } from 'sweagent';
import type { RequirementContext } from 'sweagent';

let context: RequirementContext | null = null;

const result = await processRequirementChat(userMessage, context, {
  model: { provider: 'openai', model: 'gpt-4o-mini' },
});
context = result.context;
// Use result.message, result.questions, result.finalRequirement
```

Public API: `processRequirementChat`, `runRequirementGathererAgent`, `createInitialContext`, types from `sweagent` (see `src/modules/requirement-gatherer/index.ts`).
