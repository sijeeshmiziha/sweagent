/**
 * Planning Agent -- module entry point.
 * 4-stage pipeline: discovery -> requirements -> design -> synthesis.
 * Produces implementation-ready markdown plans.
 *
 * Standalone: npx tsx --env-file=.env examples/planning/index.ts
 * One-shot:   REQUIREMENT="Fitness app" npx tsx --env-file=.env examples/planning/index.ts
 */

import { fileURLToPath } from 'node:url';
import { input } from '@inquirer/prompts';
import { processPlanningChat, runPlanningAgent, createLogger, loggerConfigFromEnv } from 'sweagent';
import type { PlanningContext } from 'sweagent';
import type { ExampleModule } from '../lib/types.js';
import { getProviderFromEnv, getModelFromEnv, printHeader, printOutput } from '../lib/input.js';
import type { Provider } from '../lib/input.js';

async function runInteractiveChat(provider: Provider, model: string): Promise<void> {
  const logger = createLogger(loggerConfigFromEnv({ name: 'planning', pretty: true }));
  let context: PlanningContext | null = null;

  console.log('Type `exit` to stop.\n');
  while (true) {
    const line = await input({ message: 'You:' });
    if (line.trim() === 'exit' || line.trim() === 'quit') break;

    const result = await processPlanningChat(line, context, {
      model: { provider, model },
      logger,
    });
    context = result.context;
    console.log(`\n[Stage: ${result.context.stage}]`);
    console.log('Assistant:', result.message);

    if (result.pendingQuestions?.length) {
      console.log('\nQuestions:');
      for (const q of result.pendingQuestions) console.log(`  - ${q}`);
    }
    if (result.planMarkdown) {
      printOutput('Plan (markdown)', result.planMarkdown, 2000);
      break;
    }
  }
}

const exampleModule: ExampleModule = {
  name: 'Planning Agent',
  description: '4-stage pipeline producing implementation-ready markdown plans.',
  examples: [
    {
      name: '01 - Planning Agent',
      script: '01-planning-agent.ts',
      description: 'Chat-based planning with discovery, requirements, design, synthesis',
    },
  ],
  async run() {
    printHeader(
      'Planning Agent',
      'Stages: discovery -> requirements -> design -> complete.\n' +
        'Describe your project, then say "continue" to advance stages.'
    );

    const provider = getProviderFromEnv();
    const model = getModelFromEnv();

    // One-shot mode
    const envInput = process.env.REQUIREMENT ?? process.env.AGENT_INPUT;
    if (envInput) {
      console.log('Running in one-shot mode...\n');
      const logger = createLogger(loggerConfigFromEnv({ name: 'planning', pretty: true }));
      const result = await runPlanningAgent({
        input: envInput,
        model: { provider, model },
        logger,
      });
      printOutput('Plan Output', result.output);
      return;
    }

    await runInteractiveChat(provider, model);
  },
};

export default exampleModule;

const isStandalone = process.argv[1] === fileURLToPath(import.meta.url);
if (isStandalone) {
  exampleModule.run().catch(console.error);
}
