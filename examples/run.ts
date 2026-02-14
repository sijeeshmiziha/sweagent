/**
 * Interactive example launcher.
 * Select an example and provide env-var inputs via prompts, then run the example.
 * API keys are read from .env only; this script does not prompt for them.
 *
 * Run: npm run example:interactive
 */

import { select, input, confirm } from '@inquirer/prompts';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const currentDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(currentDir, '..');

interface ExampleEntry {
  value: string;
  name: string;
  group: 'Core' | 'Hello World' | 'DB Designer' | 'React Builder' | 'Requirement Gatherer';
  envVars: string[];
}

const EXAMPLES: ExampleEntry[] = [
  {
    value: 'examples/core/01-basic-model.ts',
    name: '01 - Basic Model',
    group: 'Core',
    envVars: ['PROVIDER', 'MODEL', 'PROMPT', 'TEMPERATURE'],
  },
  {
    value: 'examples/core/02-all-providers.ts',
    name: '02 - All Providers',
    group: 'Core',
    envVars: ['PROMPT'],
  },
  {
    value: 'examples/core/03-tool-calling.ts',
    name: '03 - Tool Calling',
    group: 'Core',
    envVars: ['PROVIDER', 'MODEL', 'PROMPT', 'MAX_ITERATIONS'],
  },
  {
    value: 'examples/core/04-agent-with-multiple-tools.ts',
    name: '04 - Agent with Multiple Tools',
    group: 'Core',
    envVars: ['PROVIDER', 'MODEL', 'PROMPT', 'MAX_ITERATIONS'],
  },
  {
    value: 'examples/core/05-subagents.ts',
    name: '05 - Subagents',
    group: 'Core',
    envVars: ['PROVIDER', 'MODEL', 'PROMPT', 'MAX_ITERATIONS'],
  },
  {
    value: 'examples/hello-world/01-hello-world.ts',
    name: '01 - Hello World',
    group: 'Hello World',
    envVars: ['PROVIDER', 'MODEL', 'PROMPT', 'SYSTEM_PROMPT', 'MAX_ITERATIONS'],
  },
  {
    value: 'examples/db-designer/01-db-designer-agent.ts',
    name: '01 - DB Designer Agent',
    group: 'DB Designer',
    envVars: ['PROVIDER', 'MODEL', 'REQUIREMENT', 'MAX_ITERATIONS'],
  },
  {
    value: 'examples/react-builder/01-react-builder-agent.ts',
    name: '01 - React Builder Agent',
    group: 'React Builder',
    envVars: ['PROVIDER', 'MODEL', 'GRAPHQL_SCHEMA', 'MAX_ITERATIONS'],
  },
  {
    value: 'examples/requirement-gatherer/01-requirement-gatherer-agent.ts',
    name: '01 - Requirement Gatherer Agent',
    group: 'Requirement Gatherer',
    envVars: ['PROVIDER', 'MODEL', 'REQUIREMENT', 'MAX_ITERATIONS'],
  },
];

const ENV_VAR_LABELS: Record<string, string> = {
  PROVIDER: 'AI provider (openai | anthropic | google)',
  MODEL: 'Model name (e.g. gpt-4o-mini)',
  PROMPT: 'User prompt',
  TEMPERATURE: 'Temperature (0-2)',
  GRAPHQL_SCHEMA: 'GraphQL schema',
  SYSTEM_PROMPT: 'System prompt',
  MAX_ITERATIONS: 'Max agent iterations',
  REQUIREMENT: 'Project info / natural language requirement (leave empty for interactive chat)',
};

const ENV_VAR_DEFAULTS: Record<string, string> = {
  PROVIDER: 'openai',
  MODEL: 'gpt-4o-mini',
  PROMPT: 'Explain what TypeScript is in one sentence.',
  TEMPERATURE: '0.7',
  AGENT_INPUT: 'What is 25 multiplied by 4?',
  REQUIREMENT:
    'Project: Task Manager\nGoal: Let users create tasks, assign them to team members, and track progress.\nFeatures: User auth, task CRUD, assignments, due dates, status (todo/in progress/done), simple dashboard.',
  SYSTEM_PROMPT:
    'You are a friendly greeter. Use the hello_world tool to greet each person the user mentions.',
  MAX_ITERATIONS: '5',
  REPO_URL: 'https://github.com/sweagent/sweagent',
  TARGET_DIR: 'examples/db-designer',
};

async function promptForEnvVars(
  envVars: string[],
  entry?: ExampleEntry
): Promise<Record<string, string>> {
  const collected: Record<string, string> = {};
  const isRequirementGatherer = entry?.group === 'Requirement Gatherer';
  for (const key of envVars) {
    let label = ENV_VAR_LABELS[key] ?? key;
    if (isRequirementGatherer && key === 'REQUIREMENT') {
      label =
        'Requirement (leave empty to run interactive chat; non-empty = one-shot with this string)';
    }
    let defaultValue = ENV_VAR_DEFAULTS[key] ?? '';
    if (isRequirementGatherer && key === 'REQUIREMENT') {
      defaultValue = '';
    }
    const value = await input({
      message: label,
      default: defaultValue,
    });
    collected[key] = value;
  }
  return collected;
}

function runExample(scriptPath: string, envOverrides: Record<string, string>): void {
  const env = { ...process.env, ...envOverrides };
  execSync(`npx tsx --env-file=.env ${scriptPath}`, {
    cwd: projectRoot,
    env,
    stdio: 'inherit',
  });
}

const GROUPS = [
  'Core',
  'Hello World',
  'DB Designer',
  'React Builder',
  'Requirement Gatherer',
] as const;
type Group = (typeof GROUPS)[number];

async function main(): Promise<void> {
  const selectedGroup = await select<Group>({
    message: 'Select a folder',
    choices: GROUPS.map(g => ({ value: g, name: g })),
  });

  const examplesInGroup = EXAMPLES.filter(e => e.group === selectedGroup);
  const selectedPath = await select({
    message: `Select an example (${selectedGroup})`,
    choices: examplesInGroup.map(e => ({ value: e.value, name: e.name })),
  });

  const entry = examplesInGroup.find(e => e.value === selectedPath);
  if (!entry) {
    console.error('Unknown example:', selectedPath);
    process.exit(1);
  }

  const envOverrides = entry.envVars.length > 0 ? await promptForEnvVars(entry.envVars, entry) : {};

  console.log(`\nRunning: ${entry.name}\n`);
  runExample(entry.value, envOverrides);

  const runAgain = await confirm({
    message: 'Run another example?',
    default: true,
  });

  if (runAgain) {
    await main();
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
