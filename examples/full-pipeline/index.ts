/**
 * Full Pipeline -- module entry point.
 * Chains all domain agents end-to-end: from a vague idea to implementation-ready specs.
 *
 * Standalone: npx tsx --env-file=.env examples/full-pipeline/index.ts
 * One-shot:   REQUIREMENT="Project management SaaS" npx tsx --env-file=.env examples/full-pipeline/index.ts
 */

import { select } from '@inquirer/prompts';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import type { ExampleModule } from '../lib/types.js';
import { printHeader } from '../lib/input.js';

const currentDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(currentDir, '../..');

const PIPELINE_EXAMPLES = [
  {
    name: '01 - Full Pipeline (7 agents)',
    script: '01-full-pipeline.ts',
    description: 'Requirements -> Data Model -> API -> Auth -> Backend -> Frontend -> Execution',
  },
  {
    name: '02 - Pipeline with Builders (9 agents)',
    script: '02-pipeline-with-builders.ts',
    description: 'Full pipeline + Express/Apollo and React/Next.js code generation',
  },
];

const exampleModule: ExampleModule = {
  name: 'Full Pipeline',
  description: 'End-to-end agent pipeline from idea to implementation-ready specs.',
  examples: PIPELINE_EXAMPLES,
  async run() {
    printHeader(
      'Full Pipeline',
      'Chain all domain agents end-to-end.\n' +
        "Each agent's output feeds the next. All outputs saved to output/ directory.\n" +
        'Set REQUIREMENT env var for non-interactive mode.'
    );

    const selected = await select({
      message: 'Select a pipeline:',
      choices: PIPELINE_EXAMPLES.map(e => ({
        value: e.script,
        name: `${e.name} -- ${e.description}`,
      })),
    });

    console.log(`\nRunning: ${selected}\n`);
    execSync(`npx tsx --env-file=.env examples/full-pipeline/${selected}`, {
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
