/**
 * Shared input helpers for examples.
 * Provides env/CLI reading (getInput, requireInput) and interactive prompt helpers
 * used by all module index.ts files.
 */

import { select, input } from '@inquirer/prompts';

export type Provider = 'openai' | 'anthropic' | 'google';

// ---------------------------------------------------------------------------
// Env / CLI param reading
// ---------------------------------------------------------------------------

const argvMap = ((): Record<string, string> => {
  const out: Record<string, string> = {};
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith('--') && arg.includes('=')) {
      const parts = arg.slice(2).split('=');
      const key = parts[0];
      if (!key) continue;
      const value = parts.slice(1).join('=').trim();
      const normalized = key.replace(/-/g, '_').toUpperCase();
      out[normalized] = value;
    }
  }
  return out;
})();

/** Get a string value from env or CLI param (--KEY=value). */
export function getInput(name: string): string | undefined {
  const envVal = process.env[name];
  if (envVal !== undefined && envVal !== '') return envVal;
  const paramKey = name.replace(/-/g, '_').toUpperCase();
  return argvMap[paramKey];
}

/** Require a string input; exit with message if missing. */
export function requireInput(
  name: string,
  example = `Set ${name} in env or pass --${name.replace(/_/g, '-').toLowerCase()}=value`
): string {
  const v = getInput(name);
  if (v === undefined || v === '') {
    console.error(example);
    process.exit(1);
  }
  return v;
}

// ---------------------------------------------------------------------------
// Environment helpers (non-interactive)
// ---------------------------------------------------------------------------

/** Read AI provider from PROVIDER env var. Defaults to 'openai'. */
export function getProviderFromEnv(): Provider {
  return (process.env.PROVIDER ?? 'openai') as Provider;
}

/** Read model name from MODEL env var. Defaults to 'gpt-4o-mini'. */
export function getModelFromEnv(): string {
  return process.env.MODEL ?? 'gpt-4o-mini';
}

// ---------------------------------------------------------------------------
// Interactive prompt helpers
// ---------------------------------------------------------------------------

/** Prompt for AI provider; skips if PROVIDER env var is set. */
export async function promptProvider(): Promise<Provider> {
  const envVal = process.env.PROVIDER;
  if (envVal) return envVal as Provider;
  return select<Provider>({
    message: 'AI provider:',
    choices: [
      { value: 'openai', name: 'OpenAI' },
      { value: 'anthropic', name: 'Anthropic' },
      { value: 'google', name: 'Google' },
    ],
  });
}

/** Prompt for model name; skips if MODEL env var is set. */
export async function promptModel(defaultModel = 'gpt-4o-mini'): Promise<string> {
  const envVal = process.env.MODEL;
  if (envVal) return envVal;
  return input({ message: 'Model name:', default: defaultModel });
}

/** Prompt for project requirement; skips if REQUIREMENT env var is set. */
export async function promptRequirement(
  label = 'Describe your project:',
  defaultValue = ''
): Promise<string> {
  const envVal = process.env.REQUIREMENT;
  if (envVal) return envVal;
  return input({ message: label, default: defaultValue });
}

// ---------------------------------------------------------------------------
// Output helpers
// ---------------------------------------------------------------------------

/** Print a formatted header block. */
export function printHeader(title: string, description: string): void {
  console.log(`=== ${title} ===\n`);
  console.log(description + '\n');
}

/** Print truncated output with a label. */
export function printOutput(label: string, output: string, maxLen = 3000): void {
  console.log(`\n--- ${label} ---`);
  console.log(output.slice(0, maxLen) + (output.length > maxLen ? '\n...' : ''));
}

// ---------------------------------------------------------------------------
// Refinement helpers
// ---------------------------------------------------------------------------

/** Build an input that includes the previous output + feedback for targeted refinement. */
export function buildRefinementInput(
  originalInput: string,
  previousOutput: string,
  feedback: string
): string {
  return (
    `${originalInput}\n\n` +
    `Previously generated output:\n${previousOutput}\n\n` +
    `Feedback: ${feedback}\n` +
    `Refine the output based on the feedback above. Keep everything that works, only change what the feedback mentions.`
  );
}

// ---------------------------------------------------------------------------
// Interactive review helpers
// ---------------------------------------------------------------------------

export interface ReviewResult {
  action: 'accept' | 'regenerate' | 'skip';
  feedback?: string;
}

/** Show a preview and let the user accept, regenerate, or skip a step's output. */
export async function reviewStep(
  stepName: string,
  output: string,
  isInteractive: boolean
): Promise<ReviewResult> {
  if (!isInteractive) return { action: 'accept' };

  const preview = output.slice(0, 500) + (output.length > 500 ? '\n...' : '');
  console.log(`\n  --- ${stepName} Preview ---`);
  console.log(preview);

  const action = await select<'accept' | 'regenerate' | 'skip'>({
    message: `[${stepName}] Review this output:`,
    choices: [
      { value: 'accept', name: 'Accept -- continue' },
      { value: 'regenerate', name: 'Regenerate -- provide feedback and re-run' },
      { value: 'skip', name: 'Skip -- use empty output' },
    ],
  });

  if (action === 'regenerate') {
    const feedback = await input({ message: 'Your feedback:' });
    return { action: 'regenerate', feedback };
  }

  return { action };
}
