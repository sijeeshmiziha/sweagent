/**
 * API Designer Agent -- module entry point.
 * Designs REST or GraphQL APIs with endpoint analysis and contracts.
 *
 * Standalone: npx tsx --env-file=.env examples/api-designer/index.ts
 * One-shot:   REQUIREMENT="Task manager API" npx tsx --env-file=.env examples/api-designer/index.ts
 */

import { fileURLToPath } from 'node:url';
import { select } from '@inquirer/prompts';
import { runApiDesignerAgent, createLogger, loggerConfigFromEnv } from 'sweagent';
import type { ExampleModule } from '../lib/types.js';
import {
  getProviderFromEnv,
  getModelFromEnv,
  promptRequirement,
  printHeader,
  printOutput,
} from '../lib/input.js';

const exampleModule: ExampleModule = {
  name: 'API Designer',
  description: 'Designs enterprise-quality REST or GraphQL APIs with contracts.',
  examples: [
    {
      name: '01 - API Designer Agent',
      script: '01-api-designer-agent.ts',
      description: 'Endpoint analysis, request/response contracts, validation rules',
    },
  ],
  async run() {
    printHeader(
      'API Designer Agent',
      'Designs APIs with endpoint analysis, request/response contracts, and validation rules.'
    );

    const provider = getProviderFromEnv();
    const model = getModelFromEnv();
    const logger = createLogger(loggerConfigFromEnv({ name: 'api-designer', pretty: true }));

    const requirement = await promptRequirement(
      'Describe your API requirements:',
      'Task manager with users, projects, tasks (CRUD), assignments, due dates, status tracking. Users can be admin or member.'
    );

    const apiStyle = await select({
      message: 'API style:',
      choices: [
        { value: 'rest', name: 'REST' },
        { value: 'graphql', name: 'GraphQL' },
      ],
    });

    console.log('\nRunning api-designer agent...\n');
    const result = await runApiDesignerAgent({
      input: `${requirement}\n\nAPI style: ${apiStyle}`,
      model: { provider, model },
      logger,
    });

    printOutput('API Design Output', result.output);
    console.log(`\nSteps: ${result.steps.length}`);
  },
};

export default exampleModule;

const isStandalone = process.argv[1] === fileURLToPath(import.meta.url);
if (isStandalone) {
  exampleModule.run().catch(console.error);
}
