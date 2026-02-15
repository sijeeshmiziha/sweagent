/**
 * Example: Frontend Architect Agent
 *
 * Interactive frontend architecture design using the frontend-architect specialist agent.
 * Produces page specs, component taxonomy, and routing design.
 *
 * Run:
 *   npx tsx --env-file=.env examples/frontend-architect/01-frontend-architect-agent.ts
 *   npm run example:frontend-architect
 *
 * One-shot: REQUIREMENT="Dashboard app with users, analytics, settings" npx tsx ...
 */

import { input } from '@inquirer/prompts';
import { runFrontendArchitectAgent, createLogger, loggerConfigFromEnv } from 'sweagent';

const logger = createLogger(loggerConfigFromEnv({ name: 'frontend-architect', pretty: true }));

async function main() {
  console.log('=== Frontend Architect Agent ===\n');
  console.log('Designs enterprise-quality frontend architectures:');
  console.log('pages, routes, components, state management.\n');

  const provider = (process.env.PROVIDER ?? 'openai') as 'openai' | 'anthropic' | 'google';
  const modelName = process.env.MODEL ?? 'gpt-4o-mini';

  const requirement =
    process.env.REQUIREMENT ??
    (await input({
      message: 'Describe your frontend requirements:',
      default:
        'Fitness app with Next.js. Pages: landing, signup, login, dashboard, workout log, nutrition tracker, goals, profile, settings. Admin panel for user management.',
    }));

  console.log('\nRunning frontend-architect agent...\n');
  const result = await runFrontendArchitectAgent({
    input: requirement,
    model: { provider, model: modelName },
    logger,
  });

  console.log('\n--- Frontend Design Output ---');
  console.log(result.output.slice(0, 3000) + (result.output.length > 3000 ? '\n...' : ''));
  console.log(`\nSteps: ${result.steps.length}`);
}

main().catch(console.error);
