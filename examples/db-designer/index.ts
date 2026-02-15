/**
 * DB Designer Agent -- module entry point.
 * Orchestrator with entity-analyzer and schema-refiner sub-agents
 * producing MongoDB schemas from natural language.
 *
 * Standalone: npx tsx --env-file=.env examples/db-designer/index.ts
 * One-shot:   REQUIREMENT="E-commerce app" npx tsx --env-file=.env examples/db-designer/index.ts
 */

import { fileURLToPath } from 'node:url';
import { runDbDesignerAgent, createLogger, loggerConfigFromEnv } from 'sweagent';
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
  name: 'DB Designer',
  description: 'Generates MongoDB schemas from natural language using sub-agents.',
  examples: [
    {
      name: '01 - DB Designer Agent',
      script: '01-db-designer-agent.ts',
      description: 'Orchestrator with entity-analyzer and schema-refiner sub-agents',
    },
  ],
  async run() {
    printHeader(
      'DB Designer Agent',
      'Generates MongoDB project schemas with modules, fields, relationships, indexes, and validation.'
    );

    const provider = getProviderFromEnv();
    const model = getModelFromEnv();
    const logger = createLogger(loggerConfigFromEnv({ name: 'db-designer', pretty: true }));
    const maxIterations = Number(process.env.MAX_ITERATIONS ?? '10') || 10;

    const requirement = await promptRequirement(
      'Describe your project for DB design:',
      'E-commerce: users, orders, products. Admins manage products. Users place orders and have a profile.'
    );

    const isInteractive = !process.env.REQUIREMENT;
    let agentInput = requirement;

    while (true) {
      console.log('\nRunning db-designer agent...\n');
      const result = await runDbDesignerAgent({
        input: agentInput,
        model: { provider, model },
        maxIterations,
        logger,
      });

      printOutput('DB Schema Output', result.output);
      console.log(`\nSteps: ${result.steps.length}`);
      if (result.totalUsage) {
        console.log(
          `Tokens: input=${result.totalUsage.inputTokens ?? 0} output=${result.totalUsage.outputTokens ?? 0}`
        );
      }

      const review = await reviewStep('DB Designer', result.output, isInteractive);
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
