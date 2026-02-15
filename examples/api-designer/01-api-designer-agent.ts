/**
 * Example: API Designer Agent
 *
 * Interactive API design using the api-designer specialist agent.
 * Produces enterprise-quality REST or GraphQL API designs.
 *
 * Run:
 *   npx tsx --env-file=.env examples/api-designer/01-api-designer-agent.ts
 *   npm run example:api-designer
 *
 * One-shot: REQUIREMENT="Design REST API for a task manager" npx tsx ...
 */

import { input, select } from '@inquirer/prompts';
import { runApiDesignerAgent, createLogger, loggerConfigFromEnv } from 'sweagent';

const logger = createLogger(loggerConfigFromEnv({ name: 'api-designer', pretty: true }));

async function main() {
  console.log('=== API Designer Agent ===\n');
  console.log('Designs enterprise-quality APIs with endpoint analysis,');
  console.log('request/response contracts, and validation rules.\n');

  const provider = (process.env.PROVIDER ?? 'openai') as 'openai' | 'anthropic' | 'google';
  const modelName = process.env.MODEL ?? 'gpt-4o-mini';

  const requirement =
    process.env.REQUIREMENT ??
    (await input({
      message: 'Describe your API requirements:',
      default:
        'Task manager with users, projects, tasks (CRUD), assignments, due dates, status tracking. Users can be admin or member.',
    }));

  const apiStyle = await select({
    message: 'API style:',
    choices: [
      { value: 'rest', name: 'REST' },
      { value: 'graphql', name: 'GraphQL' },
    ],
  });

  const fullInput = `${requirement}\n\nAPI style: ${apiStyle}`;

  console.log('\nRunning api-designer agent...\n');
  const result = await runApiDesignerAgent({
    input: fullInput,
    model: { provider, model: modelName },
    logger,
  });

  console.log('\n--- API Design Output ---');
  console.log(result.output.slice(0, 3000) + (result.output.length > 3000 ? '\n...' : ''));
  console.log(`\nSteps: ${result.steps.length}`);
}

main().catch(console.error);
