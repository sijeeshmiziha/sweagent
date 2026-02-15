/**
 * Requirement Gatherer Agent -- module entry point.
 * Multi-stage pipeline producing structured JSON requirements.
 *
 * Standalone: npx tsx --env-file=.env examples/requirement-gatherer/index.ts
 * One-shot:   REQUIREMENT="Task manager" npx tsx --env-file=.env examples/requirement-gatherer/index.ts
 * Save:       SAVE_REQUIREMENT=1 npx tsx --env-file=.env examples/requirement-gatherer/index.ts
 */

import { fileURLToPath } from 'node:url';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { input } from '@inquirer/prompts';
import { processRequirementChat, createLogger, loggerConfigFromEnv } from 'sweagent';
import type { RequirementContext } from 'sweagent';
import type { ExampleModule } from '../lib/types.js';
import { getProviderFromEnv, getModelFromEnv, printHeader } from '../lib/input.js';

async function processTurn(
  msg: string,
  context: RequirementContext | null,
  config: { provider: string; model: string; logger: ReturnType<typeof createLogger> }
): Promise<{ done: boolean; context: RequirementContext }> {
  const result = await processRequirementChat(msg, context, {
    model: { provider: config.provider as 'openai', model: config.model },
    logger: config.logger,
  });
  console.log(`\n[Stage: ${result.context.stage}]`);
  console.log('Assistant:', result.message);
  if (result.questions?.length) {
    console.log('\nQuestions:');
    for (const q of result.questions) {
      console.log(`  - ${q.question}`);
      if (q.suggestions?.length) console.log(`    Suggestions: ${q.suggestions.join(', ')}`);
    }
  }
  if (result.finalRequirement) {
    console.log('\n--- Final Requirement Document ---');
    console.log(JSON.stringify(result.finalRequirement, null, 2));
    if (process.env.SAVE_REQUIREMENT === '1') {
      const path = join(process.cwd(), 'requirement-output.json');
      await writeFile(path, JSON.stringify(result.finalRequirement, null, 2), 'utf-8');
      console.log('\nSaved to', path);
    }
    return { done: true, context: result.context };
  }
  return { done: false, context: result.context };
}

const exampleModule: ExampleModule = {
  name: 'Requirement Gatherer',
  description: 'Multi-stage pipeline producing structured JSON requirements.',
  examples: [
    {
      name: '01 - Requirement Gatherer Agent',
      script: '01-requirement-gatherer-agent.ts',
      description: 'Chat-based gathering: actors, flows, stories, modules',
    },
  ],
  async run() {
    printHeader(
      'Requirement Gatherer',
      'Stages: discovery -> requirements -> design -> complete.\n' +
        'Describe your project; say "continue" to advance. Type `exit` to stop.'
    );

    const provider = getProviderFromEnv();
    const model = getModelFromEnv();
    const logger = createLogger(
      loggerConfigFromEnv({ name: 'requirement-gatherer', pretty: true })
    );
    let context: RequirementContext | null = null;

    // One-shot mode
    const envInput = process.env.REQUIREMENT ?? process.env.AGENT_INPUT;
    if (envInput) {
      let turn = await processTurn(envInput, context, { provider, model, logger });
      context = turn.context;
      for (let i = 0; i < 10 && !turn.done; i++) {
        turn = await processTurn('continue', context, { provider, model, logger });
        context = turn.context;
      }
      if (!turn.done) console.log('\nStopped after 10 turns. Use interactive mode for more.');
      return;
    }

    // Interactive chat mode
    while (true) {
      const line = await input({ message: 'You:' });
      if (line.trim() === 'exit' || line.trim() === 'quit') break;
      const turn = await processTurn(line, context, { provider, model, logger });
      context = turn.context;
      if (turn.done) break;
    }
  },
};

export default exampleModule;

const isStandalone = process.argv[1] === fileURLToPath(import.meta.url);
if (isStandalone) {
  exampleModule.run().catch(console.error);
}
