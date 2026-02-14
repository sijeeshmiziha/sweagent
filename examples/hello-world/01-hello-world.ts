/**
 * Example: Hello World Agent
 *
 * Minimal agent with a greeting tool.
 *
 * Setup:
 *   npm install sweagent
 *   export OPENAI_API_KEY="sk-..."
 *
 * Run:
 *   npx tsx 01-hello-world.ts
 */
import { runHelloWorldAgent, createLogger } from 'sweagent';
import type { AgentStep } from 'sweagent';

const logger = createLogger({
  name: 'hello-world',
  level: 'info',
  pretty: true,
});

async function main() {
  logger.info('Hello World Agent started');

  const provider = (process.env.PROVIDER ?? 'openai') as 'openai' | 'anthropic' | 'google';
  const modelName = process.env.MODEL ?? 'gpt-4o-mini';
  const agentInput = process.env.AGENT_INPUT ?? 'Greet Alice and Bob.';
  const systemPrompt =
    process.env.SYSTEM_PROMPT ??
    'You are a friendly greeter. Use the hello_world tool to greet each person the user mentions.';
  const maxIterations = Number(process.env.MAX_ITERATIONS ?? '5') || 5;

  const result = await runHelloWorldAgent({
    input: agentInput,
    model: { provider, model: modelName },
    systemPrompt,
    maxIterations,
    logger,
    onStep: (step: AgentStep) => {
      const stepNum = step.iteration + 1;

      if (step.toolCalls?.length) {
        for (const tc of step.toolCalls) {
          logger.debug('Step', { stepNum, tool: tc.toolName, input: tc.input });
        }
      } else {
        const preview = step.content?.slice(0, 80) ?? '';
        logger.debug('Step response', { stepNum, preview });
      }

      if (step.toolResults?.length) {
        for (const tr of step.toolResults) {
          const status = tr.isError ? 'ERROR' : 'OK';
          logger.debug('Tool result', { toolName: tr.toolName, status });
        }
      }

      if (step.usage) {
        logger.debug('Step usage', step.usage);
      }
    },
  });

  logger.info('Agent completed', { steps: result.steps.length });
  console.log('--- Final output ---');
  console.log(result.output);
  console.log(`\nTotal steps: ${result.steps.length}`);
  if (result.totalUsage) {
    console.log(
      `Total tokens: input=${result.totalUsage.inputTokens ?? 0} output=${result.totalUsage.outputTokens ?? 0}`
    );
  }
}

main().catch(console.error);
