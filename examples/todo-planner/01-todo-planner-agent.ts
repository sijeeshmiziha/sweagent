/**
 * Example: Todo Planner Agent
 *
 * Runs the todo-planner orchestrator to decompose a problem into
 * dependency-aware, actionable tasks with effort estimates and risks.
 *
 * Run:
 *   npx tsx --env-file=.env examples/todo-planner/01-todo-planner-agent.ts
 *   npm run example:todo-planner
 *
 * One-shot: REQUIREMENT="Add payment processing" npx tsx ...
 */

import { input } from '@inquirer/prompts';
import { runTodoPlannerAgent, createLogger, loggerConfigFromEnv } from 'sweagent';

const logger = createLogger(loggerConfigFromEnv({ name: 'todo-planner', pretty: true }));

async function main() {
  console.log('=== Todo Planner Agent ===\n');
  console.log('Decomposes problems into structured todo plans:');
  console.log('tasks, dependencies, execution order, effort estimates, risks.\n');

  const provider = (process.env.PROVIDER ?? 'openai') as 'openai' | 'anthropic' | 'google';
  const modelName = process.env.MODEL ?? 'gpt-4o-mini';

  const requirement =
    process.env.REQUIREMENT ??
    (await input({
      message: 'Describe the problem or task to plan:',
      default:
        'Add user authentication with JWT tokens, refresh tokens, and role-based access control (admin, editor, viewer) to an existing Express.js API with MongoDB.',
    }));

  console.log('\nRunning todo-planner agent...\n');
  const result = await runTodoPlannerAgent({
    input: requirement,
    model: { provider, model: modelName },
    logger,
  });

  console.log('\n--- Todo Plan Output ---');
  console.log(result.output.slice(0, 3000) + (result.output.length > 3000 ? '\n...' : ''));
  console.log(`\nSteps: ${result.steps.length}`);
}

main().catch(console.error);
