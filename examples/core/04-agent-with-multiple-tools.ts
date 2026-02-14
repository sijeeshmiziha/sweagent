/**
 * Example: Agent with Multiple Tools
 *
 * Agent with web_search, write_file, and get_current_time tools.
 *
 * Setup:
 *   npm install sweagent
 *   export OPENAI_API_KEY="sk-..."
 *
 * Run:
 *   npx tsx 04-agent-with-multiple-tools.ts
 */
import { createModel, createToolSet, defineTool, runAgent, createLogger } from 'sweagent';
import { z } from 'zod';

const logger = createLogger({
  name: 'multi-tool',
  level: 'info',
  pretty: true,
});

const searchTool = defineTool({
  name: 'web_search',
  description: 'Search for information on the web',
  input: z.object({ query: z.string() }),
  handler: async ({ query }) => {
    logger.debug('Search', { query });
    return {
      results: [
        `Result 1: Best practices for ${query}`,
        `Result 2: Common patterns in ${query}`,
        `Result 3: Advanced tips for ${query}`,
      ],
    };
  },
});

const writeFileTool = defineTool({
  name: 'write_file',
  description: 'Write content to a file (simulated)',
  input: z.object({
    filename: z.string(),
    content: z.string(),
  }),
  handler: async ({ filename, content }) => {
    logger.debug('WriteFile', { filename, contentLength: content.length });
    return { success: true, bytes: content.length, filename };
  },
});

const getCurrentTimeTool = defineTool({
  name: 'get_current_time',
  description: 'Get the current date and time',
  input: z.object({}),
  handler: async () => {
    const now = new Date().toISOString();
    logger.debug('Time', { time: now });
    return { time: now };
  },
});

async function main() {
  logger.info('Testing multi-tool agent');

  const provider = (process.env.PROVIDER ?? 'openai') as 'openai' | 'anthropic' | 'google';
  const modelName = process.env.MODEL ?? 'gpt-4o-mini';
  const agentInput =
    process.env.AGENT_INPUT ??
    'What time is it now? Then search for "TypeScript best practices" and summarize one tip.';
  const maxIterations = Number(process.env.MAX_ITERATIONS ?? '10') || 10;

  const result = await runAgent({
    model: createModel({
      provider,
      model: modelName,
      apiKey: process.env.OPENAI_API_KEY,
    }),
    tools: createToolSet({
      web_search: searchTool,
      write_file: writeFileTool,
      get_current_time: getCurrentTimeTool,
    }),
    systemPrompt:
      'You are a research assistant. Use the web_search tool at most once or twice to find information. After you have the search results, respond with your final summary in plain text and do not call any more tools.',
    input: agentInput,
    maxIterations,
    logger,
    onStep: step => {
      if (step.toolCalls?.length) {
        step.toolCalls.forEach(tc => {
          logger.debug('Step', { iteration: step.iteration + 1, tool: tc.toolName });
        });
      } else {
        logger.debug('Step', { iteration: step.iteration + 1, phase: 'response' });
      }
    },
  });

  logger.info('Agent completed', { steps: result.steps.length });
  console.log('\n✓ Agent completed');
  console.log('\n--- ANSWER ---\n');
  console.log(result.output);
  console.log('\n--- STATS ---');
  console.log('Steps:', result.steps.length);
  console.log('Total tokens:', result.totalUsage);
}

main().catch(console.error);
