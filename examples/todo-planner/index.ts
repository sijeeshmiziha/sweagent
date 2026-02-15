/**
 * Todo Planner Agent -- module entry point.
 * Decomposes problems into dependency-aware, actionable todo plans.
 *
 * Standalone: npx tsx --env-file=.env examples/todo-planner/index.ts
 * One-shot:   REQUIREMENT="Add auth" npx tsx --env-file=.env examples/todo-planner/index.ts
 */

import { fileURLToPath } from 'node:url';
import { runTodoPlannerAgent, createLogger, loggerConfigFromEnv } from 'sweagent';
import type { ExampleModule } from '../lib/types.js';
import {
  getProviderFromEnv,
  getModelFromEnv,
  promptRequirement,
  printHeader,
  printOutput,
} from '../lib/input.js';

const exampleModule: ExampleModule = {
  name: 'Todo Planner',
  description: 'Decomposes problems into dependency-aware, actionable todo plans.',
  examples: [
    {
      name: '01 - Todo Planner Agent',
      script: '01-todo-planner-agent.ts',
      description: 'Problem decomposition with dependency resolution and execution ordering',
    },
  ],
  async run() {
    printHeader(
      'Todo Planner Agent',
      'Decomposes problems into structured, dependency-aware todo plans with effort estimates and risks.'
    );

    const provider = getProviderFromEnv();
    const model = getModelFromEnv();
    const logger = createLogger(loggerConfigFromEnv({ name: 'todo-planner', pretty: true }));

    const requirement = await promptRequirement(
      'Describe the problem or task to plan:',
      'Add user authentication with JWT tokens, refresh tokens, and role-based access control (admin, editor, viewer) to an existing Express.js API with MongoDB.'
    );

    console.log('\nRunning todo-planner agent...\n');
    const result = await runTodoPlannerAgent({
      input: requirement,
      model: { provider, model },
      logger,
    });

    printOutput('Todo Plan Output', result.output);
    console.log(`\nSteps: ${result.steps.length}`);
  },
};

export default exampleModule;

const isStandalone = process.argv[1] === fileURLToPath(import.meta.url);
if (isStandalone) {
  exampleModule.run().catch(console.error);
}
