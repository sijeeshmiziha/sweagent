/**
 * Example: Apollo Builder Agent
 *
 * Generates Apollo GraphQL subgraph configurations from data models
 * and API designs, using existing .ref/templates/subgraph/ templates.
 *
 * Run:
 *   npx tsx --env-file=.env examples/apollo-builder/01-apollo-builder-agent.ts
 *   npm run example:apollo-builder
 *
 * One-shot: REQUIREMENT="E-commerce with users, products, orders" npx tsx ...
 */

import { input } from '@inquirer/prompts';
import { runApolloBuilderAgent, createLogger, loggerConfigFromEnv } from 'sweagent';

const logger = createLogger(loggerConfigFromEnv({ name: 'apollo-builder', pretty: true }));

async function main() {
  console.log('=== Apollo Builder Agent ===\n');
  console.log('Generates Apollo GraphQL subgraph configurations with');
  console.log('modules, types, resolvers, datasources, and auth directives.\n');

  const provider = (process.env.PROVIDER ?? 'openai') as 'openai' | 'anthropic' | 'google';
  const modelName = process.env.MODEL ?? 'gpt-4o-mini';

  const requirement =
    process.env.REQUIREMENT ??
    (await input({
      message: 'Describe your data model and API requirements:',
      default:
        'Task manager: User (name, email, role), Project (name, description, owner), Task (title, status, assignee, project). Roles: admin, member.',
    }));

  console.log('\nRunning apollo-builder agent...\n');
  const result = await runApolloBuilderAgent({
    input: requirement,
    model: { provider, model: modelName },
    logger,
  });

  console.log('\n--- Subgraph Config Output ---');
  console.log(result.output.slice(0, 3000) + (result.output.length > 3000 ? '\n...' : ''));
  console.log(`\nSteps: ${result.steps.length}`);
}

main().catch(console.error);
