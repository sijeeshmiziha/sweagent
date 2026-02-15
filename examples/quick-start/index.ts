/**
 * Quick Start Examples -- module entry point.
 * Minimal import-and-run examples showing how to use sweagent.
 *
 * Standalone: npx tsx --env-file=.env examples/quick-start/index.ts
 */

import { select } from '@inquirer/prompts';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import type { ExampleModule } from '../lib/types.js';
import { printHeader } from '../lib/input.js';

const currentDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(currentDir, '../..');

const QUICK_START_EXAMPLES = [
  {
    name: '01 - One-Shot Plan',
    script: '01-one-shot-plan.ts',
    description: 'Get a full plan with one function call (~10 lines)',
  },
  {
    name: '02 - Requirements -> Plan',
    script: '02-requirements-then-plan.ts',
    description: 'Two-agent chain with structured handoff',
  },
  {
    name: '03 - Custom Agent',
    script: '03-custom-agent.ts',
    description: 'Build your own agent with createModel + defineTool + runAgent',
  },
];

const exampleModule: ExampleModule = {
  name: 'Quick Start',
  description: 'Minimal import-and-run examples for getting started fast.',
  examples: QUICK_START_EXAMPLES,
  async run() {
    printHeader(
      'Quick Start Examples',
      'Minimal examples showing how to use sweagent.\n' +
        'Each example is self-contained and can be run standalone.'
    );

    const selected = await select({
      message: 'Select a quick-start example:',
      choices: QUICK_START_EXAMPLES.map(e => ({
        value: e.script,
        name: `${e.name} -- ${e.description}`,
      })),
    });

    console.log(`\nRunning: ${selected}\n`);
    execSync(`npx tsx --env-file=.env examples/quick-start/${selected}`, {
      cwd: projectRoot,
      env: process.env,
      stdio: 'inherit',
    });
  },
};

export default exampleModule;

const isStandalone = process.argv[1] === fileURLToPath(import.meta.url);
if (isStandalone) {
  exampleModule.run().catch(console.error);
}
