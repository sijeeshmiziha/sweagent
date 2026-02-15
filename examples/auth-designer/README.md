# Auth Designer Example

Designs auth systems with strategies, flows, middleware, role-based access, and security policies.

## Quick Start

```bash
npm install
cp .env.example .env          # add OPENAI_API_KEY
npm run example:auth-designer  # interactive prompts
```

## What It Does

Uses an orchestrator with `security-analyzer` and `flow-designer` sub-agents. Produces a complete auth design covering strategy selection, signup/login/password-reset flows, middleware configuration, role-based access control, and security policies.

## Run

```bash
# Interactive -- prompts for auth requirements
npm run example:auth-designer

# One-shot
REQUIREMENT="JWT auth for SaaS with admin and user roles" npm run example:auth-designer

# Direct script
npm run example -- examples/auth-designer/01-auth-designer-agent.ts
```

## Inputs

| Variable         | Description                      | Default       |
| ---------------- | -------------------------------- | ------------- |
| `OPENAI_API_KEY` | OpenAI API key                   | **required**  |
| `PROVIDER`       | AI provider                      | `openai`      |
| `MODEL`          | Model name                       | `gpt-4o-mini` |
| `REQUIREMENT`    | Auth requirements (skips prompt) | --            |

## Output

Auth design JSON with strategy, auth flows (signup, login, password reset), middleware config, roles/permissions, and security policies.

## Integration with Coding Agents

```typescript
import { runAuthDesignerAgent } from 'sweagent';
import { writeFileSync } from 'fs';

const result = await runAuthDesignerAgent({
  input: 'SaaS app with JWT, admin and member roles, HTTP-only cookies',
  model: { provider: 'openai', model: 'gpt-4o-mini' },
});
writeFileSync('auth-design.json', result.output);

// Cursor: "Implement auth middleware and routes from @auth-design.json"
```

## Related

- [Backend Architect](../backend-architect/) -- Full backend architecture with auth
- [Express Builder](../express-builder/) -- Express.js API with auth middleware
- [Module Reference](../../src/modules/auth-designer/README.md) -- Full API docs
