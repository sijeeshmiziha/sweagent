/**
 * Interactive example launcher.
 * Select a module, then run it with module-specific prompts and inputs.
 *
 * Run: npm run example:interactive
 *
 * Each module folder has its own index.ts that can also be run standalone:
 *   npx tsx --env-file=.env examples/planning/index.ts
 */

import { select, confirm } from '@inquirer/prompts';
import { modules } from './lib/registry.js';

async function main(): Promise<void> {
  console.log('');
  console.log('  sweagent -- Interactive Example Launcher');
  console.log('  ────────────────────────────────────────');
  console.log('  Select a module to run. Each module has domain-specific prompts.');
  console.log('  Set PROVIDER and MODEL env vars to override defaults (openai / gpt-4o-mini).');
  console.log('');

  const selected = await select({
    message: 'Select a module:',
    choices: modules.map(m => ({
      value: m.name,
      name: `${m.name}  --  ${m.description}`,
    })),
  });

  const mod = modules.find(m => m.name === selected);
  if (!mod) {
    console.error('Unknown module:', selected);
    process.exit(1);
  }

  console.log('');
  await mod.run();

  console.log('');
  const runAgain = await confirm({ message: 'Run another module?', default: true });
  if (runAgain) {
    await main();
  }
}

main().catch((err: unknown) => {
  if (err instanceof Error && err.name === 'ExitPromptError') {
    process.exit(0);
  }
  console.error(err);
  process.exit(1);
});
