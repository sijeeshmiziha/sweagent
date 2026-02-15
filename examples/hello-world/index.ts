/**
 * Hello World Agent -- module entry point.
 * Minimal agent with a greeting tool. Use as a starting point for custom agents.
 *
 * Standalone: npx tsx --env-file=.env examples/hello-world/index.ts
 */

import { fileURLToPath } from 'node:url';
import { runHelloWorldAgent, createLogger, loggerConfigFromEnv } from 'sweagent';
import type { ExampleModule } from '../lib/types.js';
import { getProviderFromEnv, getModelFromEnv, printHeader, printOutput } from '../lib/input.js';

const exampleModule: ExampleModule = {
  name: 'Hello World',
  description: 'Minimal agent template with a greeting tool.',
  examples: [
    {
      name: '01 - Hello World',
      script: '01-hello-world.ts',
      description: 'Minimal agent with greeting tool',
    },
  ],
  async run() {
    printHeader(
      'Hello World Agent',
      'Minimal agent with a greeting tool. Starting point for custom agents.'
    );

    const provider = getProviderFromEnv();
    const model = getModelFromEnv();
    const logger = createLogger(loggerConfigFromEnv({ name: 'hello-world', pretty: true }));

    const agentInput = process.env.PROMPT ?? process.env.AGENT_INPUT ?? 'Greet Alice and Bob.';
    const systemPrompt =
      process.env.SYSTEM_PROMPT ??
      'You are a friendly greeter. Use the hello_world tool to greet each person the user mentions.';
    const maxIterations = Number(process.env.MAX_ITERATIONS ?? '5') || 5;

    console.log('Running hello-world agent...\n');
    const result = await runHelloWorldAgent({
      input: agentInput,
      model: { provider, model },
      systemPrompt,
      maxIterations,
      logger,
    });

    printOutput('Hello World Output', result.output);
    console.log(`\nSteps: ${result.steps.length}`);
    if (result.totalUsage) {
      console.log(
        `Tokens: input=${result.totalUsage.inputTokens ?? 0} output=${result.totalUsage.outputTokens ?? 0}`
      );
    }
  },
};

export default exampleModule;

const isStandalone = process.argv[1] === fileURLToPath(import.meta.url);
if (isStandalone) {
  exampleModule.run().catch(console.error);
}
