/**
 * Next.js Builder Agent -- module entry point.
 * Generates Next.js App Router configurations.
 *
 * Standalone: npx tsx --env-file=.env examples/nextjs-builder/index.ts
 * One-shot:   REQUIREMENT="E-commerce frontend" npx tsx --env-file=.env examples/nextjs-builder/index.ts
 */

import { fileURLToPath } from 'node:url';
import { runNextjsBuilderAgent, createLogger, loggerConfigFromEnv } from 'sweagent';
import type { ExampleModule } from '../lib/types.js';
import {
  getProviderFromEnv,
  getModelFromEnv,
  promptRequirement,
  printHeader,
  printOutput,
} from '../lib/input.js';

const exampleModule: ExampleModule = {
  name: 'Next.js Builder',
  description: 'Generates Next.js App Router configurations with pages, layouts, and API routes.',
  examples: [
    {
      name: '01 - Next.js Builder Agent',
      script: '01-nextjs-builder-agent.ts',
      description: 'Pages, layouts, API routes, server actions, middleware',
    },
  ],
  async run() {
    printHeader(
      'Next.js Builder Agent',
      'Generates Next.js App Router configurations with pages, layouts, API routes, server actions, and middleware.'
    );

    const provider = getProviderFromEnv();
    const model = getModelFromEnv();
    const logger = createLogger(loggerConfigFromEnv({ name: 'nextjs-builder', pretty: true }));

    const requirement = await promptRequirement(
      'Describe your frontend requirements:',
      'Task manager: dashboard with stats, project list/detail pages, task board (Kanban), user settings. Auth with login/signup. SEO for public pages.'
    );

    console.log('\nRunning nextjs-builder agent...\n');
    const result = await runNextjsBuilderAgent({
      input: requirement,
      model: { provider, model },
      logger,
    });

    printOutput('Next.js Config Output', result.output);
    console.log(`\nSteps: ${result.steps.length}`);
  },
};

export default exampleModule;

const isStandalone = process.argv[1] === fileURLToPath(import.meta.url);
if (isStandalone) {
  exampleModule.run().catch(console.error);
}
