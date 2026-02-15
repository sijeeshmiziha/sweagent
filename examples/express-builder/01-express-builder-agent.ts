/**
 * Example: Express Builder Agent
 *
 * Generates Express.js REST API configurations from data models
 * and API designs, using existing .ref/templates/express/ templates.
 *
 * Run:
 *   npx tsx --env-file=.env examples/express-builder/01-express-builder-agent.ts
 *   npm run example:express-builder
 *
 * One-shot: REQUIREMENT="E-commerce with users, products, orders" npx tsx ...
 */

import { input } from '@inquirer/prompts';
import { runExpressBuilderAgent, createLogger, loggerConfigFromEnv } from 'sweagent';

const logger = createLogger(loggerConfigFromEnv({ name: 'express-builder', pretty: true }));

async function main() {
  console.log('=== Express Builder Agent ===\n');
  console.log('Generates Express.js REST API configurations with');
  console.log('controllers, models, middleware, and routes.\n');

  const provider = (process.env.PROVIDER ?? 'openai') as 'openai' | 'anthropic' | 'google';
  const modelName = process.env.MODEL ?? 'gpt-4o-mini';

  const requirement =
    process.env.REQUIREMENT ??
    (await input({
      message: 'Describe your API and data model requirements:',
      default:
        'Task manager: User (name, email, role), Project (name, description, owner), Task (title, status, assignee, project). REST API with JWT auth.',
    }));

  console.log('\nRunning express-builder agent...\n');
  const result = await runExpressBuilderAgent({
    input: requirement,
    model: { provider, model: modelName },
    logger,
  });

  console.log('\n--- Express Config Output ---');
  console.log(result.output.slice(0, 3000) + (result.output.length > 3000 ? '\n...' : ''));
  console.log(`\nSteps: ${result.steps.length}`);
}

main().catch(console.error);
