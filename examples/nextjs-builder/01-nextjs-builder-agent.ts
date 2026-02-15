/**
 * Example: Next.js Builder Agent
 *
 * Generates Next.js App Router configurations from frontend designs
 * with pages, layouts, API routes, and server actions.
 *
 * Run:
 *   npx tsx --env-file=.env examples/nextjs-builder/01-nextjs-builder-agent.ts
 *   npm run example:nextjs-builder
 *
 * One-shot: REQUIREMENT="E-commerce with users, products, orders" npx tsx ...
 */

import { input } from '@inquirer/prompts';
import { runNextjsBuilderAgent, createLogger, loggerConfigFromEnv } from 'sweagent';

const logger = createLogger(loggerConfigFromEnv({ name: 'nextjs-builder', pretty: true }));

async function main() {
  console.log('=== Next.js Builder Agent ===\n');
  console.log('Generates Next.js App Router configurations with');
  console.log('pages, layouts, API routes, server actions, and middleware.\n');

  const provider = (process.env.PROVIDER ?? 'openai') as 'openai' | 'anthropic' | 'google';
  const modelName = process.env.MODEL ?? 'gpt-4o-mini';

  const requirement =
    process.env.REQUIREMENT ??
    (await input({
      message: 'Describe your frontend requirements:',
      default:
        'Task manager: dashboard with stats, project list/detail pages, task board (Kanban), user settings. Auth with login/signup. SEO for public pages.',
    }));

  console.log('\nRunning nextjs-builder agent...\n');
  const result = await runNextjsBuilderAgent({
    input: requirement,
    model: { provider, model: modelName },
    logger,
  });

  console.log('\n--- Next.js Config Output ---');
  console.log(result.output.slice(0, 3000) + (result.output.length > 3000 ? '\n...' : ''));
  console.log(`\nSteps: ${result.steps.length}`);
}

main().catch(console.error);
