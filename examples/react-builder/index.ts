/**
 * React Builder Agent -- module entry point.
 * Generates React app configuration from GraphQL schemas.
 *
 * Standalone: npx tsx --env-file=.env examples/react-builder/index.ts
 * One-shot:   GRAPHQL_SCHEMA="type Query { users: [User!]! }" npx tsx --env-file=.env examples/react-builder/index.ts
 */

import { fileURLToPath } from 'node:url';
import { input } from '@inquirer/prompts';
import { runReactBuilderAgent, createLogger, loggerConfigFromEnv } from 'sweagent';
import type { ExampleModule } from '../lib/types.js';
import {
  getProviderFromEnv,
  getModelFromEnv,
  printHeader,
  printOutput,
  reviewStep,
  buildRefinementInput,
} from '../lib/input.js';

const DEFAULT_SCHEMA = `type Query { user(id: ID!): User users: [User!]! }
type Mutation { createUser(name: String!, email: String!): User }
type User { id: ID! name: String! email: String! }`;

const exampleModule: ExampleModule = {
  name: 'React Builder',
  description: 'Generates React app configuration from GraphQL schemas.',
  examples: [
    {
      name: '01 - React Builder Agent',
      script: '01-react-builder-agent.ts',
      description: 'GraphQL analysis, config generation, validation',
    },
  ],
  async run() {
    printHeader(
      'React Builder Agent',
      'Generates React app config (pages, fields, API hooks, branding) from a GraphQL schema.'
    );

    const provider = getProviderFromEnv();
    const model = getModelFromEnv();
    const logger = createLogger(loggerConfigFromEnv({ name: 'react-builder', pretty: true }));
    const maxIterations = Number(process.env.MAX_ITERATIONS ?? '10') || 10;

    const schema =
      process.env.GRAPHQL_SCHEMA ??
      process.env.AGENT_INPUT ??
      (await input({
        message: 'Enter GraphQL schema (or press Enter for default):',
        default: DEFAULT_SCHEMA,
      }));

    const isInteractive = !(process.env.GRAPHQL_SCHEMA ?? process.env.AGENT_INPUT);
    let agentInput = schema;

    while (true) {
      console.log('\nRunning react-builder agent...\n');
      const result = await runReactBuilderAgent({
        input: agentInput,
        model: { provider, model },
        maxIterations,
        logger,
      });

      printOutput('React Config Output', result.output);
      console.log(`\nSteps: ${result.steps.length}`);
      if (result.totalUsage) {
        console.log(
          `Tokens: input=${result.totalUsage.inputTokens ?? 0} output=${result.totalUsage.outputTokens ?? 0}`
        );
      }

      const review = await reviewStep('React Builder', result.output, isInteractive);
      if (review.action === 'regenerate') {
        agentInput = buildRefinementInput(schema, result.output, review.feedback ?? '');
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
