/**
 * Express Builder Agent -- module entry point.
 * Generates Express.js REST API configurations with routers and middleware.
 *
 * Standalone: npx tsx --env-file=.env examples/express-builder/index.ts
 * One-shot:   REQUIREMENT="E-commerce API" npx tsx --env-file=.env examples/express-builder/index.ts
 */

import { fileURLToPath } from 'node:url';
import { runExpressBuilderAgent, createLogger, loggerConfigFromEnv } from 'sweagent';
import type { ExampleModule } from '../lib/types.js';
import {
  getProviderFromEnv,
  getModelFromEnv,
  promptRequirement,
  printHeader,
  printOutput,
  reviewStep,
  buildRefinementInput,
} from '../lib/input.js';

const exampleModule: ExampleModule = {
  name: 'Express Builder',
  description: 'Generates Express.js REST API configurations with routers and middleware.',
  examples: [
    {
      name: '01 - Express Builder Agent',
      script: '01-express-builder-agent.ts',
      description: 'Controllers, models, middleware, routes, env vars',
    },
  ],
  async run() {
    printHeader(
      'Express Builder Agent',
      'Generates Express.js REST API configurations with controllers, models, middleware, and routes.'
    );

    const provider = getProviderFromEnv();
    const model = getModelFromEnv();
    const logger = createLogger(loggerConfigFromEnv({ name: 'express-builder', pretty: true }));

    const requirement = await promptRequirement(
      'Describe your API and data model requirements:',
      'Task manager: User (name, email, role), Project (name, description, owner), Task (title, status, assignee, project). REST API with JWT auth.'
    );

    const isInteractive = !process.env.REQUIREMENT;
    let agentInput = requirement;

    while (true) {
      console.log('\nRunning express-builder agent...\n');
      const result = await runExpressBuilderAgent({
        input: agentInput,
        model: { provider, model },
        logger,
      });

      printOutput('Express Config Output', result.output);
      console.log(`\nSteps: ${result.steps.length}`);

      const review = await reviewStep('Express Builder', result.output, isInteractive);
      if (review.action === 'regenerate') {
        agentInput = buildRefinementInput(requirement, result.output, review.feedback ?? '');
        console.log('\nRegenerating with feedback...\n');
        continue;
      }
      break;
    }
  },
};

export default exampleModule;

const isStandalone = process.argv[1] === fileURLToPath(import.meta.url);
if (isStandalone) {
  exampleModule.run().catch(console.error);
}
