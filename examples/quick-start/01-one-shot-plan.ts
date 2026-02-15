/**
 * Quick Start: One-Shot Plan
 *
 * Simplest possible usage -- import one function, get a full implementation plan.
 * ~10 lines of meaningful code.
 *
 * Setup:
 *   npm install sweagent
 *   export OPENAI_API_KEY="sk-..."
 *
 * Run:
 *   npx tsx --env-file=.env examples/quick-start/01-one-shot-plan.ts
 *
 * One-shot: REQUIREMENT="Fitness app with workouts" npx tsx --env-file=.env examples/quick-start/01-one-shot-plan.ts
 */
import { runPlanningAgent, createLogger, loggerConfigFromEnv } from 'sweagent';

const logger = createLogger(loggerConfigFromEnv({ name: 'quick-start', pretty: true }));

async function main() {
  const requirement =
    process.env.REQUIREMENT ??
    'Task manager app with user authentication, project boards, task assignments, due dates, and a dashboard';

  console.log('=== Quick Start: One-Shot Plan ===\n');
  console.log('Requirement:', requirement.slice(0, 120), '\n');
  console.log('Generating plan...\n');

  const result = await runPlanningAgent({
    input: requirement,
    model: {
      provider: (process.env.PROVIDER ?? 'openai') as 'openai' | 'anthropic' | 'google',
      model: process.env.MODEL ?? 'gpt-4o-mini',
    },
    logger,
  });

  console.log('--- Plan Output ---');
  console.log(result.output.slice(0, 3000) + (result.output.length > 3000 ? '\n...' : ''));
  console.log(`\nSteps: ${result.steps.length}`);
}

main().catch(console.error);
