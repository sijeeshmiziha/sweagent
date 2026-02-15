/**
 * Shared types for example module definitions.
 * Each module folder exports an ExampleModule from its index.ts.
 */

export type Provider = 'openai' | 'anthropic' | 'google';

export interface ExampleEntry {
  name: string;
  script: string;
  description: string;
}

export interface ExampleModule {
  name: string;
  description: string;
  examples: ExampleEntry[];
  run: () => Promise<void>;
}
