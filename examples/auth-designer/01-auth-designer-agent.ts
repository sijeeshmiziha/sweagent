/**
 * Example: Auth Designer Agent
 *
 * Interactive auth design using the auth-designer specialist agent.
 * Produces enterprise-quality auth flows, middleware, and security policies.
 *
 * Run:
 *   npx tsx --env-file=.env examples/auth-designer/01-auth-designer-agent.ts
 *   npm run example:auth-designer
 *
 * One-shot: REQUIREMENT="JWT auth for a SaaS app with admin and user roles" npx tsx ...
 */

import { input } from '@inquirer/prompts';
import { runAuthDesignerAgent, createLogger, loggerConfigFromEnv } from 'sweagent';

const logger = createLogger(loggerConfigFromEnv({ name: 'auth-designer', pretty: true }));

async function main() {
  console.log('=== Auth Designer Agent ===\n');
  console.log('Designs enterprise-quality authentication and authorization:');
  console.log('auth flows, middleware, RBAC, and security policies.\n');

  const provider = (process.env.PROVIDER ?? 'openai') as 'openai' | 'anthropic' | 'google';
  const modelName = process.env.MODEL ?? 'gpt-4o-mini';

  const requirement =
    process.env.REQUIREMENT ??
    (await input({
      message: 'Describe your auth requirements:',
      default:
        'SaaS app with JWT auth. Roles: admin, member. Features: signup, login, logout, password reset. HTTP-only cookies. Node.js + Express backend.',
    }));

  console.log('\nRunning auth-designer agent...\n');
  const result = await runAuthDesignerAgent({
    input: requirement,
    model: { provider, model: modelName },
    logger,
  });

  console.log('\n--- Auth Design Output ---');
  console.log(result.output.slice(0, 3000) + (result.output.length > 3000 ? '\n...' : ''));
  console.log(`\nSteps: ${result.steps.length}`);
}

main().catch(console.error);
