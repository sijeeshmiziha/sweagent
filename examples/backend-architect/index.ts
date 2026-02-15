/**
 * Backend Architect Agent -- module entry point.
 * Plans backend architecture with framework selection and service design.
 *
 * Standalone: npx tsx --env-file=.env examples/backend-architect/index.ts
 * One-shot:   REQUIREMENT="E-commerce backend" npx tsx --env-file=.env examples/backend-architect/index.ts
 */

import { fileURLToPath } from 'node:url';
import { runBackendArchitectAgent, createLogger, loggerConfigFromEnv } from 'sweagent';
import type { ExampleModule } from '../lib/types.js';
import {
  getProviderFromEnv,
  getModelFromEnv,
  promptRequirement,
  printHeader,
  printOutput,
} from '../lib/input.js';

const exampleModule: ExampleModule = {
  name: 'Backend Architect',
  description: 'Plans backend architecture with framework selection and service design.',
  examples: [
    {
      name: '01 - Backend Architect Agent',
      script: '01-backend-architect-agent.ts',
      description: 'Framework selection, services, middleware, folder structure',
    },
  ],
  async run() {
    printHeader(
      'Backend Architect Agent',
      'Designs backend architecture with framework selection, service layer, middleware stack, and folder structure.'
    );

    const provider = getProviderFromEnv();
    const model = getModelFromEnv();
    const logger = createLogger(loggerConfigFromEnv({ name: 'backend-architect', pretty: true }));

    const requirement = await promptRequirement(
      'Describe your project requirements:',
      'Task manager with users, projects, tasks (CRUD), assignments, role-based auth. MongoDB database.'
    );

    console.log('\nRunning backend-architect agent...\n');
    const result = await runBackendArchitectAgent({
      input: requirement,
      model: { provider, model },
      logger,
    });

    printOutput('Backend Design Output', result.output);
    console.log(`\nSteps: ${result.steps.length}`);
  },
};

export default exampleModule;

const isStandalone = process.argv[1] === fileURLToPath(import.meta.url);
if (isStandalone) {
  exampleModule.run().catch(console.error);
}
