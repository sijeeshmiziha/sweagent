/**
 * Example: Planning Agent (chat-based)
 *
 * Interactive multi-turn chat using processPlanningChat. Returns plan as raw markdown
 * (log and return only; no file writing). No JSON parsing or validation errors.
 *
 * Setup:
 *   npm install sweagent
 *   export OPENAI_API_KEY="sk-..."
 *
 * Run:
 *   npx tsx 01-planning-agent.ts
 *   npm run example:planning
 *
 * One-shot (env): REQUIREMENT="Fitness app with workouts and nutrition" npx tsx 01-planning-agent.ts
 *
 * Logging: configured via .env (SWE_LOG_LEVEL, SWE_LOG_ENABLED, SWE_LOG_PRETTY, etc.).
 */
import { input } from '@inquirer/prompts';
import { processPlanningChat, runPlanningAgent, createLogger, loggerConfigFromEnv } from 'sweagent';
import type { PlanningContext } from 'sweagent';

const logger = createLogger(loggerConfigFromEnv({ name: 'planning', pretty: true }));
const chatLogger = logger.child({ component: 'Chat' });

const STAGES = 'discovery → requirements → design → complete';

function printInstructions(): void {
  console.log('=== Planning Agent (Chat) ===\n');
  console.log('Stages:', STAGES);
  console.log('Describe your project. Once discovery has stored a description, say "continue"');
  console.log(
    'to advance to the next stage (requirements → design → complete) without re-running discovery.'
  );
  console.log('Output is raw markdown only (logged and returned; no file). No JSON parsing.');
  console.log('Type `exit` or `quit` to stop.\n');
}

async function main() {
  printInstructions();

  const provider = (process.env.PROVIDER ?? 'openai') as 'openai' | 'anthropic' | 'google';
  const modelName = process.env.MODEL ?? 'gpt-4o-mini';
  let context: PlanningContext | null = null;

  const processTurn = async (userMessage: string): Promise<boolean> => {
    try {
      const result = await processPlanningChat(userMessage, context, {
        model: { provider, model: modelName },
        logger: chatLogger,
      });
      context = result.context;
      console.log('\n[Stage:', result.context.stage + ']');
      console.log('Assistant:', result.message);
      if (result.pendingQuestions?.length) {
        console.log('\nQuestions:');
        for (const q of result.pendingQuestions) console.log(`  - ${q}`);
      }
      if (result.planMarkdown) {
        console.log('\n--- Plan (markdown) ---');
        console.log(
          result.planMarkdown.slice(0, 2000) + (result.planMarkdown.length > 2000 ? '\n...' : '')
        );
        return true;
      }
      return false;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      chatLogger.error('Chat turn failed', err instanceof Error ? err : { message: msg });
      if (/api key|invalid api key|authorization/i.test(msg)) {
        console.error('Set OPENAI_API_KEY (or ANTHROPIC_API_KEY / GEMINI_API_KEY) and try again.');
      } else {
        console.error('Check provider/model (PROVIDER, MODEL) and try again.');
      }
      throw err;
    }
  };

  const envInput = process.env.REQUIREMENT ?? process.env.AGENT_INPUT;
  if (envInput) {
    const result = await runPlanningAgent({
      input: envInput,
      model: { provider, model: modelName },
      logger: chatLogger,
    });
    console.log('\n--- Plan output ---');
    console.log(result.output.slice(0, 3000) + (result.output.length > 3000 ? '\n...' : ''));
    return;
  }

  while (true) {
    const line = await input({ message: 'You:' });
    const trimmed = line.trim();
    if (trimmed === 'exit' || trimmed === 'quit') break;
    const done = await processTurn(trimmed);
    if (done) break;
  }
}

main().catch(console.error);
