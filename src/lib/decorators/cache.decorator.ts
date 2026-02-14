/**
 * Cache decorator for tool execution - caches results by (toolName, JSON input).
 */

import type { ToolSet, ExecuteToolOptions } from '../tools/tools';
import type { ToolExecutionResult } from '../types/tool';

export type ToolExecutorFn = (
  tools: ToolSet,
  name: string,
  input: unknown,
  options?: ExecuteToolOptions
) => Promise<ToolExecutionResult>;

function cacheKey(name: string, input: unknown): string {
  try {
    return `${name}:${JSON.stringify(input)}`;
  } catch {
    return `${name}:${String(input)}`;
  }
}

export function withCache(executor: ToolExecutorFn): ToolExecutorFn {
  const cache = new Map<string, ToolExecutionResult>();

  return async function cacheExecutor(
    tools: ToolSet,
    name: string,
    input: unknown,
    options?: ExecuteToolOptions
  ): Promise<ToolExecutionResult> {
    const key = cacheKey(name, input);
    const hit = cache.get(key);
    if (hit !== undefined) {
      options?.logger?.debug('Tool cache hit', { name });
      return hit;
    }
    const result = await executor(tools, name, input, options);
    if (result.success) cache.set(key, result);
    return result;
  };
}
