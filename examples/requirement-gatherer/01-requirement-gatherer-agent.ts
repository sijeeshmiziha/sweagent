/**
 * Example: Requirement Gatherer Agent (chat-based)
 *
 * Interactive multi-turn chat using processRequirementChat. Persists context
 * between turns; produces a final requirement document (database + API design).
 *
 * Setup:
 *   npm install sweagent
 *   export OPENAI_API_KEY="sk-..."
 *
 * Run:
 *   npx tsx 01-requirement-gatherer-agent.ts
 *   npm run example:requirement-gatherer
 *
 * One-shot (env): REQUIREMENT="Task manager app with REST API" npx tsx 01-requirement-gatherer-agent.ts
 * Save output:    SAVE_REQUIREMENT=1 npx tsx 01-requirement-gatherer-agent.ts
 *
 * Logging: configured via .env (SWE_LOG_LEVEL, SWE_LOG_ENABLED, SWE_LOG_PRETTY, etc.). Logs use stderr so the prompt and assistant output stay clear on stdout.
 */
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { input } from '@inquirer/prompts';
import { processRequirementChat, createLogger, loggerConfigFromEnv } from 'sweagent';
import type { RequirementContext } from 'sweagent';

const logger = createLogger(loggerConfigFromEnv({ name: 'requirement-gatherer', pretty: true }));
const chatLogger = logger.child({ component: 'Chat' });

const STAGES = 'discovery → requirements → design → complete';

function printInstructions(): void {
  console.log('=== Requirement Gatherer (Chat) ===\n');
  console.log('Stages:', STAGES);
  console.log('Describe your project; say "continue" to advance when there are no questions.');
  console.log('Answer any questions shown; then say "continue" to move on.');
  console.log('Type `exit` or `quit` to stop.\n');
}

async function saveRequirementToFile(finalRequirement: unknown): Promise<void> {
  const path = join(process.cwd(), 'requirement-output.json');
  await writeFile(path, JSON.stringify(finalRequirement, null, 2), 'utf-8');
  console.log('\nSaved to', path);
}

async function main() {
  printInstructions();

  const provider = (process.env.PROVIDER ?? 'openai') as 'openai' | 'anthropic' | 'google';
  const modelName = process.env.MODEL ?? 'gpt-4o-mini';
  let context: RequirementContext | null = null;

  const processTurn = async (userMessage: string): Promise<boolean> => {
    try {
      const result = await processRequirementChat(userMessage, context, {
        model: { provider, model: modelName },
        logger: chatLogger,
      });
      context = result.context;
      console.log('\n[Stage:', result.context.stage + ']');
      console.log('Assistant:', result.message);
      if (result.questions?.length) {
        console.log('\nQuestions:');
        for (const q of result.questions) {
          console.log(`  - ${q.question}`);
          if (q.suggestions?.length) console.log(`    Suggestions: ${q.suggestions.join(', ')}`);
        }
      }
      if (result.finalRequirement) {
        console.log('\n--- Final requirement document ---');
        console.log(JSON.stringify(result.finalRequirement, null, 2));
        if (process.env.SAVE_REQUIREMENT === '1') {
          await saveRequirementToFile(result.finalRequirement);
        }
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
    const done = await processTurn(envInput);
    if (done) return;
    if (!context) return;
    let turns = 0;
    while (turns < 10) {
      const done = await processTurn('continue');
      if (done) return;
      turns++;
    }
    console.log('\nStopped after 10 turns. Use interactive mode for more.');
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
