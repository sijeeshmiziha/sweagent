/**
 * Frontend Architect Agent -- module entry point.
 * Plans frontend architecture with pages, components, and routing.
 *
 * Standalone: npx tsx --env-file=.env examples/frontend-architect/index.ts
 * One-shot:   REQUIREMENT="Dashboard app" npx tsx --env-file=.env examples/frontend-architect/index.ts
 */

import { fileURLToPath } from 'node:url';
import { runFrontendArchitectAgent, createLogger, loggerConfigFromEnv } from 'sweagent';
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
  name: 'Frontend Architect',
  description: 'Plans frontend architecture with pages, components, state, and routing.',
  examples: [
    {
      name: '01 - Frontend Architect Agent',
      script: '01-frontend-architect-agent.ts',
      description: 'Page specs, component taxonomy, routing, state management',
    },
  ],
  async run() {
    printHeader(
      'Frontend Architect Agent',
      'Designs frontend architectures: pages, routes, reusable components, and state management.'
    );

    const provider = getProviderFromEnv();
    const model = getModelFromEnv();
    const logger = createLogger(loggerConfigFromEnv({ name: 'frontend-architect', pretty: true }));

    const requirement = await promptRequirement(
      'Describe your frontend requirements:',
      'Fitness app with Next.js. Pages: landing, signup, login, dashboard, workout log, nutrition tracker, goals, profile, settings. Admin panel for user management.'
    );

    const isInteractive = !process.env.REQUIREMENT;
    let agentInput = requirement;

    while (true) {
      console.log('\nRunning frontend-architect agent...\n');
      const result = await runFrontendArchitectAgent({
        input: agentInput,
        model: { provider, model },
        logger,
      });

      printOutput('Frontend Design Output', result.output);
      console.log(`\nSteps: ${result.steps.length}`);

      const review = await reviewStep('Frontend Architect', result.output, isInteractive);
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
