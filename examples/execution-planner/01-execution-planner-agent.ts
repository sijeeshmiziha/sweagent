/**
 * Example: Execution Planner Agent
 *
 * Interactive execution planning using the execution-planner specialist agent.
 * Produces phased implementation plans, edge cases, and testing checklists.
 *
 * Run:
 *   npx tsx --env-file=.env examples/execution-planner/01-execution-planner-agent.ts
 *   npm run example:execution-planner
 *
 * One-shot: REQUIREMENT="Plan implementation for a task manager app" npx tsx ...
 */

import { input } from '@inquirer/prompts';
import { runExecutionPlannerAgent, createLogger, loggerConfigFromEnv } from 'sweagent';

const logger = createLogger(loggerConfigFromEnv({ name: 'execution-planner', pretty: true }));

async function main() {
  console.log('=== Execution Planner Agent ===\n');
  console.log('Creates enterprise-quality execution plans:');
  console.log('phased implementation, edge cases, testing checklists.\n');

  const provider = (process.env.PROVIDER ?? 'openai') as 'openai' | 'anthropic' | 'google';
  const modelName = process.env.MODEL ?? 'gpt-4o-mini';

  const requirement =
    process.env.REQUIREMENT ??
    (await input({
      message: 'Describe your project for execution planning:',
      default:
        'Task manager app with Next.js, MongoDB, JWT auth. Features: user CRUD, project CRUD, task management with assignments and due dates, simple dashboard with task stats.',
    }));

  console.log('\nRunning execution-planner agent...\n');
  const result = await runExecutionPlannerAgent({
    input: requirement,
    model: { provider, model: modelName },
    logger,
  });

  console.log('\n--- Execution Plan Output ---');
  console.log(result.output.slice(0, 3000) + (result.output.length > 3000 ? '\n...' : ''));
  console.log(`\nSteps: ${result.steps.length}`);
}

main().catch(console.error);
