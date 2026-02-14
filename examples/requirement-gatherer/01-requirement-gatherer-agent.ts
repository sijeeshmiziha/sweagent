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
 *
 * Or one-shot (no prompts):
 *   REQUIREMENT="Task manager app with REST API" npx tsx 01-requirement-gatherer-agent.ts
 */
import { input } from '@inquirer/prompts';
import { processRequirementChat } from 'sweagent';
import type { RequirementContext } from 'sweagent';

async function main() {
  console.log('=== Requirement Gatherer (Chat) ===\n');
  console.log('Describe your project. Say "continue" to advance, or answer any questions.\n');

  const provider = (process.env.PROVIDER ?? 'openai') as 'openai' | 'anthropic' | 'google';
  const modelName = process.env.MODEL ?? 'gpt-4o-mini';
  let context: RequirementContext | null = null;

  const processTurn = async (userMessage: string): Promise<boolean> => {
    const result = await processRequirementChat(userMessage, context, {
      model: { provider, model: modelName },
    });
    context = result.context;
    console.log('\nAssistant:', result.message);
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
      return true;
    }
    return false;
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
