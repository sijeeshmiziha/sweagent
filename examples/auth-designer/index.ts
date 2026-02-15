/**
 * Auth Designer Agent -- module entry point.
 * Designs auth systems with strategies, flows, middleware, and RBAC.
 *
 * Standalone: npx tsx --env-file=.env examples/auth-designer/index.ts
 * One-shot:   REQUIREMENT="JWT auth for SaaS" npx tsx --env-file=.env examples/auth-designer/index.ts
 */

import { fileURLToPath } from 'node:url';
import { runAuthDesignerAgent, createLogger, loggerConfigFromEnv } from 'sweagent';
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
  name: 'Auth Designer',
  description: 'Designs auth flows, middleware, RBAC, and security policies.',
  examples: [
    {
      name: '01 - Auth Designer Agent',
      script: '01-auth-designer-agent.ts',
      description: 'Auth strategies, signup/login flows, middleware, roles',
    },
  ],
  async run() {
    printHeader(
      'Auth Designer Agent',
      'Designs authentication and authorization: auth flows, middleware, RBAC, and security policies.'
    );

    const provider = getProviderFromEnv();
    const model = getModelFromEnv();
    const logger = createLogger(loggerConfigFromEnv({ name: 'auth-designer', pretty: true }));

    const requirement = await promptRequirement(
      'Describe your auth requirements:',
      'SaaS app with JWT auth. Roles: admin, member. Features: signup, login, logout, password reset. HTTP-only cookies. Node.js + Express backend.'
    );

    const isInteractive = !process.env.REQUIREMENT;
    let agentInput = requirement;

    while (true) {
      console.log('\nRunning auth-designer agent...\n');
      const result = await runAuthDesignerAgent({
        input: agentInput,
        model: { provider, model },
        logger,
      });

      printOutput('Auth Design Output', result.output);
      console.log(`\nSteps: ${result.steps.length}`);

      const review = await reviewStep('Auth Designer', result.output, isInteractive);
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
