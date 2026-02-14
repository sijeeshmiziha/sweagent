/**
 * Example: Tool Calling with Agent
 *
 * Agent with a calculator tool.
 *
 * Setup:
 *   npm install sweagent
 *   export OPENAI_API_KEY="sk-..."
 *
 * Run:
 *   npx tsx 03-tool-calling.ts
 */
import { createModel, createToolSet, defineTool, runAgent, createLogger } from 'sweagent';
import { z } from 'zod';

const logger = createLogger({
  name: 'tool-calling',
  level: 'info',
  pretty: true,
});

const calculatorTool = defineTool({
  name: 'calculator',
  description: 'Perform basic math operations',
  input: z.object({
    operation: z.enum(['add', 'subtract', 'multiply', 'divide']),
    a: z.number(),
    b: z.number(),
  }),
  handler: async ({ operation, a, b }) => {
    const ops = {
      add: a + b,
      subtract: a - b,
      multiply: a * b,
      divide: a / b,
    };
    logger.debug('Calculator', { operation, a, b, result: ops[operation] });
    return { result: ops[operation] };
  },
});

async function main() {
  logger.info('Testing agent with tools');

  const provider = (process.env.PROVIDER ?? 'openai') as 'openai' | 'anthropic' | 'google';
  const modelName = process.env.MODEL ?? 'gpt-4o-mini';
  const agentInput = process.env.AGENT_INPUT ?? 'What is 25 multiplied by 4?';
  const maxIterations = Number(process.env.MAX_ITERATIONS ?? '5') || 5;

  const result = await runAgent({
    model: createModel({
      provider,
      model: modelName,
      apiKey: process.env.OPENAI_API_KEY,
    }),
    tools: createToolSet({ calculator: calculatorTool }),
    systemPrompt: 'You are a helpful math assistant. Use the calculator tool to solve problems.',
    input: agentInput,
    maxIterations,
    logger,
    onStep: step => {
      logger.debug('Step', {
        iteration: step.iteration + 1,
        tool: step.toolCalls?.[0]?.toolName ?? 'thinking',
      });
    },
  });

  logger.info('Agent completed', { steps: result.steps.length });
  console.log('\nFinal answer:', result.output);
  console.log('Steps taken:', result.steps.length);
  console.log('Total tokens:', result.totalUsage);
}

main().catch(console.error);
