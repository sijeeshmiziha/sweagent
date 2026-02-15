/**
 * Apollo Builder Agent -- module entry point.
 * Generates Apollo Federation v2 subgraph configurations.
 *
 * Standalone: npx tsx --env-file=.env examples/apollo-builder/index.ts
 * One-shot:   REQUIREMENT="E-commerce subgraph" npx tsx --env-file=.env examples/apollo-builder/index.ts
 */

import { fileURLToPath } from 'node:url';
import { runApolloBuilderAgent, createLogger, loggerConfigFromEnv } from 'sweagent';
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
  name: 'Apollo Builder',
  description: 'Generates Apollo Federation v2 subgraph configurations.',
  examples: [
    {
      name: '01 - Apollo Builder Agent',
      script: '01-apollo-builder-agent.ts',
      description: 'Modules, GraphQL types, resolvers, datasources, auth directives',
    },
  ],
  async run() {
    printHeader(
      'Apollo Builder Agent',
      'Generates Apollo GraphQL subgraph configurations with modules, types, resolvers, and datasources.'
    );

    const provider = getProviderFromEnv();
    const model = getModelFromEnv();
    const logger = createLogger(loggerConfigFromEnv({ name: 'apollo-builder', pretty: true }));

    const requirement = await promptRequirement(
      'Describe your data model and API requirements:',
      'Task manager: User (name, email, role), Project (name, description, owner), Task (title, status, assignee, project). Roles: admin, member.'
    );

    const isInteractive = !process.env.REQUIREMENT;
    let agentInput = requirement;

    while (true) {
      console.log('\nRunning apollo-builder agent...\n');
      const result = await runApolloBuilderAgent({
        input: agentInput,
        model: { provider, model },
        logger,
      });

      printOutput('Subgraph Config Output', result.output);
      console.log(`\nSteps: ${result.steps.length}`);

      const review = await reviewStep('Apollo Builder', result.output, isInteractive);
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
