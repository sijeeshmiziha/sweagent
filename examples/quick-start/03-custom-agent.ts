/**
 * Quick Start: Custom Agent from Scratch
 *
 * Build your own agent using the core framework primitives:
 * createModel + defineTool + createToolSet + runAgent.
 *
 * Setup:
 *   npm install sweagent
 *   export OPENAI_API_KEY="sk-..."
 *
 * Run:
 *   npx tsx --env-file=.env examples/quick-start/03-custom-agent.ts
 */
import { createModel, defineTool, createToolSet, runAgent, createLogger } from 'sweagent';
import { z } from 'zod';

const logger = createLogger({ name: 'custom-agent', level: 'info', pretty: true });

// 1. Define tools with Zod schemas
const lookupTool = defineTool({
  name: 'lookup_word',
  description: 'Look up the definition of a word',
  input: z.object({ word: z.string().describe('The word to look up') }),
  handler: async ({ word }) => {
    const definitions: Record<string, string> = {
      agent: 'A program that uses an LLM to decide which actions to take',
      tool: 'A function an agent can invoke to interact with external systems',
      pipeline: 'A sequence of processing stages where each stage feeds the next',
    };
    return { definition: definitions[word.toLowerCase()] ?? `No definition found for "${word}"` };
  },
});

const countTool = defineTool({
  name: 'count_chars',
  description: 'Count the number of characters in a string',
  input: z.object({ text: z.string().describe('The text to count characters in') }),
  handler: async ({ text }) => ({ count: text.length }),
});

async function main() {
  console.log('=== Quick Start: Custom Agent ===\n');

  // 2. Create the model
  const model = createModel({
    provider: (process.env.PROVIDER ?? 'openai') as 'openai' | 'anthropic' | 'google',
    model: process.env.MODEL ?? 'gpt-4o-mini',
  });

  // 3. Build a tool set
  const tools = createToolSet({
    lookup_word: lookupTool,
    count_chars: countTool,
  });

  // 4. Run the agent
  const result = await runAgent({
    model,
    tools,
    systemPrompt:
      'You are a helpful assistant. Use the lookup_word tool to find definitions ' +
      'and count_chars to count characters when asked.',
    input:
      process.env.AGENT_INPUT ??
      'What is an "agent"? And how many characters are in the word "pipeline"?',
    maxIterations: 5,
    logger,
    onStep: step => {
      const tool = step.toolCalls?.[0]?.toolName ?? 'thinking';
      console.log(`  Step ${step.iteration + 1}: ${tool}`);
    },
  });

  console.log('\n--- Agent Output ---');
  console.log(result.output);
  console.log(`\nSteps: ${result.steps.length}`);
  if (result.totalUsage) {
    console.log(
      `Tokens: input=${result.totalUsage.inputTokens ?? 0} output=${result.totalUsage.outputTokens ?? 0}`
    );
  }
}

main().catch(console.error);
