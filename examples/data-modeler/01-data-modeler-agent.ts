/**
 * Example: Data Modeler Agent
 *
 * Interactive data modeling using the data-modeler specialist agent.
 * Produces enterprise-quality data models for MongoDB or PostgreSQL.
 *
 * Run:
 *   npx tsx --env-file=.env examples/data-modeler/01-data-modeler-agent.ts
 *   npm run example:data-modeler
 *
 * One-shot: REQUIREMENT="Fitness app with users, workouts, nutrition" npx tsx ...
 */

import { input, select } from '@inquirer/prompts';
import { runDataModelerAgent, createLogger, loggerConfigFromEnv } from 'sweagent';

const logger = createLogger(loggerConfigFromEnv({ name: 'data-modeler', pretty: true }));

async function main() {
  console.log('=== Data Modeler Agent ===\n');
  console.log('Designs enterprise-quality data models with entity analysis,');
  console.log('relationship mapping, and schema refinement.\n');

  const provider = (process.env.PROVIDER ?? 'openai') as 'openai' | 'anthropic' | 'google';
  const modelName = process.env.MODEL ?? 'gpt-4o-mini';

  const requirement =
    process.env.REQUIREMENT ??
    (await input({
      message: 'Describe your project for data modeling:',
      default:
        'Fitness app with users, workout tracking (exercises, sets, reps), nutrition logging (meals, calories, macros), and progress goals.',
    }));

  const dbType = await select({
    message: 'Target database:',
    choices: [
      { value: 'mongodb', name: 'MongoDB' },
      { value: 'postgresql', name: 'PostgreSQL' },
    ],
  });

  const fullInput = `${requirement}\n\nTarget database: ${dbType}`;

  console.log('\nRunning data-modeler agent...\n');
  const result = await runDataModelerAgent({
    input: fullInput,
    model: { provider, model: modelName },
    logger,
  });

  console.log('\n--- Data Model Output ---');
  console.log(result.output.slice(0, 3000) + (result.output.length > 3000 ? '\n...' : ''));
  console.log(`\nSteps: ${result.steps.length}`);
}

main().catch(console.error);
