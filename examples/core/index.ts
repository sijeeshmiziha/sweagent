/**
 * Core Framework Examples -- module entry point.
 * Lists the 5 progressive core examples and runs the selected one.
 *
 * Standalone: npx tsx --env-file=.env examples/core/index.ts
 */

import { select } from '@inquirer/prompts';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import type { ExampleModule } from '../lib/types.js';
import { printHeader } from '../lib/input.js';

const currentDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(currentDir, '../..');

const CORE_EXAMPLES = [
  { name: '01 - Basic Model', script: '01-basic-model.ts', description: 'Simple model invocation' },
  {
    name: '02 - All Providers',
    script: '02-all-providers.ts',
    description: 'OpenAI, Anthropic, and Google in one script',
  },
  {
    name: '03 - Tool Calling',
    script: '03-tool-calling.ts',
    description: 'Agent with a calculator tool (Zod schema)',
  },
  {
    name: '04 - Multiple Tools',
    script: '04-agent-with-multiple-tools.ts',
    description: 'Agent with search, file write, and calculator',
  },
  {
    name: '05 - Subagents',
    script: '05-subagents.ts',
    description: 'Parent agent with researcher + summarizer sub-agents',
  },
];

const exampleModule: ExampleModule = {
  name: 'Core Framework',
  description: 'Foundation examples: model calls, tools, agent loops, sub-agents.',
  examples: CORE_EXAMPLES,
  async run() {
    printHeader(
      'Core Framework Examples',
      'Progressive examples: model invocation -> tool calling -> agent loop -> sub-agents.'
    );

    const selected = await select({
      message: 'Select a core example:',
      choices: CORE_EXAMPLES.map(e => ({
        value: e.script,
        name: `${e.name} -- ${e.description}`,
      })),
    });

    console.log(`\nRunning: ${selected}\n`);
    execSync(`npx tsx --env-file=.env examples/core/${selected}`, {
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
