/**
 * sweagent - Multi-provider AI software engineering agent framework
 * with tool calling support
 *
 * @example
 * ```typescript
 * import { createModel, runAgent, defineTool } from 'sweagent';
 *
 * const model = createModel({ provider: 'openai', model: 'gpt-4o' });
 *
 * const result = await runAgent({
 *   model,
 *   tools: [],
 *   systemPrompt: 'You are a helpful assistant.',
 *   input: 'Hello!',
 * });
 *
 * console.log(result.output);
 * ```
 */

// Framework
export * from './lib';

// Modules
export * from './modules';
