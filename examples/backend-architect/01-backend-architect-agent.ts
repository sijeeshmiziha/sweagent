/**
 * Example: Backend Architect Agent
 *
 * Routing orchestrator that designs backend architecture and selects
 * Express (REST) or Apollo (GraphQL) based on project requirements.
 *
 * Run:
 *   npx tsx --env-file=.env examples/backend-architect/01-backend-architect-agent.ts
 *   npm run example:backend-architect
 *
 * One-shot: REQUIREMENT="E-commerce with users, products, orders" npx tsx ...
 */

import { input } from '@inquirer/prompts';
import { runBackendArchitectAgent, createLogger, loggerConfigFromEnv } from 'sweagent';

const logger = createLogger(loggerConfigFromEnv({ name: 'backend-architect', pretty: true }));

async function main() {
  console.log('=== Backend Architect Agent ===\n');
  console.log('Designs backend architecture with framework selection,');
  console.log('service layer, middleware stack, and folder structure.\n');

  const provider = (process.env.PROVIDER ?? 'openai') as 'openai' | 'anthropic' | 'google';
  const modelName = process.env.MODEL ?? 'gpt-4o-mini';

  const requirement =
    process.env.REQUIREMENT ??
    (await input({
      message: 'Describe your project requirements:',
      default:
        'Task manager with users, projects, tasks (CRUD), assignments, role-based auth. MongoDB database.',
    }));

  console.log('\nRunning backend-architect agent...\n');
  const result = await runBackendArchitectAgent({
    input: requirement,
    model: { provider, model: modelName },
    logger,
  });

  console.log('\n--- Backend Design Output ---');
  console.log(result.output.slice(0, 3000) + (result.output.length > 3000 ? '\n...' : ''));
  console.log(`\nSteps: ${result.steps.length}`);
}

main().catch(console.error);
