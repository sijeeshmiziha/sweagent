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
