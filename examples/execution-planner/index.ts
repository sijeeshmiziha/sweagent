/**
 * Execution Planner Agent -- module entry point.
 * Creates phased implementation plans with edge cases and testing checklists.
 *
 * Standalone: npx tsx --env-file=.env examples/execution-planner/index.ts
 * One-shot:   REQUIREMENT="Task manager" npx tsx --env-file=.env examples/execution-planner/index.ts
 */

import { fileURLToPath } from 'node:url';
import { runExecutionPlannerAgent, createLogger, loggerConfigFromEnv } from 'sweagent';
import type { ExampleModule } from '../lib/types.js';
import {
  getProviderFromEnv,
  getModelFromEnv,
  promptRequirement,
  printHeader,
  printOutput,
} from '../lib/input.js';

const exampleModule: ExampleModule = {
  name: 'Execution Planner',
  description: 'Creates phased implementation plans with edge cases and testing checklists.',
  examples: [
    {
      name: '01 - Execution Planner Agent',
      script: '01-execution-planner-agent.ts',
      description: 'Phased plan, edge cases, testing checklist, security/performance notes',
    },
  ],
  async run() {
    printHeader(
      'Execution Planner Agent',
      'Creates phased implementation plans: phases, edge cases, testing checklists, security, and performance notes.'
    );

    const provider = getProviderFromEnv();
    const model = getModelFromEnv();
    const logger = createLogger(loggerConfigFromEnv({ name: 'execution-planner', pretty: true }));

    const requirement = await promptRequirement(
      'Describe your project for execution planning:',
      'Task manager app with Next.js, MongoDB, JWT auth. Features: user CRUD, project CRUD, task management with assignments and due dates, simple dashboard with task stats.'
    );

    console.log('\nRunning execution-planner agent...\n');
    const result = await runExecutionPlannerAgent({
      input: requirement,
      model: { provider, model },
      logger,
    });

    printOutput('Execution Plan Output', result.output);
    console.log(`\nSteps: ${result.steps.length}`);
  },
};

export default exampleModule;

const isStandalone = process.argv[1] === fileURLToPath(import.meta.url);
if (isStandalone) {
  exampleModule.run().catch(console.error);
}
