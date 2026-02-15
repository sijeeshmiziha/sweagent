/**
 * Data Modeler Agent -- module entry point.
 * Designs enterprise-quality data models for MongoDB or PostgreSQL.
 *
 * Standalone: npx tsx --env-file=.env examples/data-modeler/index.ts
 * One-shot:   REQUIREMENT="Fitness app" npx tsx --env-file=.env examples/data-modeler/index.ts
 */

import { fileURLToPath } from 'node:url';
import { select } from '@inquirer/prompts';
import { runDataModelerAgent, createLogger, loggerConfigFromEnv } from 'sweagent';
import type { ExampleModule } from '../lib/types.js';
import {
  getProviderFromEnv,
  getModelFromEnv,
  promptRequirement,
  printHeader,
  printOutput,
} from '../lib/input.js';

const exampleModule: ExampleModule = {
  name: 'Data Modeler',
  description: 'Designs enterprise-quality data models for MongoDB or PostgreSQL.',
  examples: [
    {
      name: '01 - Data Modeler Agent',
      script: '01-data-modeler-agent.ts',
      description: 'Entity analysis, relationship mapping, schema refinement',
    },
  ],
  async run() {
    printHeader(
      'Data Modeler Agent',
      'Designs data models with entity analysis, relationship mapping, and schema refinement.'
    );

    const provider = getProviderFromEnv();
    const model = getModelFromEnv();
    const logger = createLogger(loggerConfigFromEnv({ name: 'data-modeler', pretty: true }));

    const requirement = await promptRequirement(
      'Describe your project for data modeling:',
      'Fitness app with users, workout tracking (exercises, sets, reps), nutrition logging (meals, calories, macros), and progress goals.'
    );

    const dbType = await select({
      message: 'Target database:',
      choices: [
        { value: 'mongodb', name: 'MongoDB' },
        { value: 'postgresql', name: 'PostgreSQL' },
      ],
    });

    console.log('\nRunning data-modeler agent...\n');
    const result = await runDataModelerAgent({
      input: `${requirement}\n\nTarget database: ${dbType}`,
      model: { provider, model },
      logger,
    });

    printOutput('Data Model Output', result.output);
    console.log(`\nSteps: ${result.steps.length}`);
  },
};

export default exampleModule;

const isStandalone = process.argv[1] === fileURLToPath(import.meta.url);
if (isStandalone) {
  exampleModule.run().catch(console.error);
}
