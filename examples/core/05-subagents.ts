/**
 * Example: Subagents (researcher + summarizer)
 *
 * A parent agent delegates to two subagents: a researcher (read-only search tool)
 * and a summarizer (no tools). The parent coordinates by calling subagent tools.
 *
 * Setup:
 *   npm install sweagent
 *   export OPENAI_API_KEY="sk-..."
 *
 * Run:
 *   npx tsx 05-subagents.ts
 */
import {
  createModel,
  createToolSet,
  defineTool,
  defineSubagent,
  createSubagentToolSet,
  runAgent,
  createLogger,
} from 'sweagent';
import type { AgentStep } from 'sweagent';
import { z } from 'zod';

const logger = createLogger({
  name: 'subagents',
  level: 'info',
  pretty: true,
});

// --- Read-only tool for the researcher subagent ---
const searchTool = defineTool({
  name: 'web_search',
  description: 'Search for information on the web',
  input: z.object({ query: z.string() }),
  handler: async ({ query }) => {
    logger.debug('Researcher search', { query });
    return {
      results: [
        `Summary: Key points about ${query} from source A.`,
        `Summary: Additional context on ${query} from source B.`,
      ],
    };
  },
});

// --- Subagent definitions ---
const researcherDef = defineSubagent({
  name: 'researcher',
  description:
    'Research specialist. Use when you need to gather information or look up facts. Returns research findings as text.',
  systemPrompt: `You are a research assistant. Use the web_search tool to find information. Call the tool once or twice, then return a concise summary of what you found. Do not make up facts.`,
  tools: { web_search: searchTool },
  maxIterations: 5,
});

const summarizerDef = defineSubagent({
  name: 'summarizer',
  description:
    'Summarization specialist. Use when you have text (e.g. research results) and need a short, clear summary.',
  systemPrompt: `You are a summarization assistant. You have no tools. The user will give you text to summarize. Respond with a clear, concise summary only. Do not add new information.`,
  tools: {},
  maxIterations: 2,
});

const PARENT_SYSTEM_PROMPT = `You are a coordinator. When the user asks a question:
1. Use subagent_researcher with a prompt that asks for relevant research (e.g. "Research: <topic>").
2. Then use subagent_summarizer with a prompt that includes the researcher's output and asks for a short summary.
3. Reply to the user with the final summary.`;

async function main() {
  const provider = (process.env.PROVIDER ?? 'openai') as 'openai' | 'anthropic' | 'google';
  const modelName = process.env.MODEL ?? 'gpt-4o-mini';
  const agentInput =
    process.env.AGENT_INPUT ?? 'Research "TypeScript 5 features" and give me a short summary.';
  const maxIterations = Number(process.env.MAX_ITERATIONS ?? '10') || 10;

  logger.info('Subagents example started', { prompt: agentInput, provider, model: modelName });

  const parentModel = createModel({
    provider,
    model: modelName,
    apiKey: process.env.OPENAI_API_KEY,
  });
  const subagentTools = createSubagentToolSet([researcherDef, summarizerDef], {
    parentModel,
  });
  const parentTools = createToolSet(subagentTools);

  const result = await runAgent({
    model: parentModel,
    tools: parentTools,
    systemPrompt: PARENT_SYSTEM_PROMPT,
    input: agentInput,
    maxIterations,
    logger,
    onStep: (step: AgentStep) => {
      logger.debug('Step', { iteration: step.iteration + 1, hasContent: !!step.content });
      if (step.content) {
        logger.debug('Agent content', { preview: step.content.slice(0, 100) });
      }
      if (step.toolCalls?.length) {
        for (const tc of step.toolCalls) {
          logger.debug('Tool call', { toolName: tc.toolName });
        }
      }
    },
  });

  logger.info('Done', { steps: result.steps.length, hasOutput: !!result.output });
  console.log('=== Done ===\n');
  console.log('Final output:\n');
  console.log(result.output);
  console.log('\nSteps:', result.steps.length);
  if (result.totalUsage) {
    console.log('Total tokens:', result.totalUsage);
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
