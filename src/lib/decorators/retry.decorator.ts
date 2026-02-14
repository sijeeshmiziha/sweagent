/**
 * Retry decorator for tool execution - retries on failure up to maxRetries.
 */

import type { ToolSet, ExecuteToolOptions } from '../tools/tools';
import type { ToolExecutionResult } from '../types/tool';

export type ToolExecutorFn = (
  tools: ToolSet,
  name: string,
  input: unknown,
  options?: ExecuteToolOptions
) => Promise<ToolExecutionResult>;

export function withRetry(executor: ToolExecutorFn, maxRetries = 2): ToolExecutorFn {
  return async function retryExecutor(
    tools: ToolSet,
    name: string,
    input: unknown,
    options?: ExecuteToolOptions
  ): Promise<ToolExecutionResult> {
    let last: ToolExecutionResult | undefined;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      last = await executor(tools, name, input, options);
      if (last.success) return last;
      options?.logger?.warn('Tool attempt failed, retrying', {
        name,
        attempt: attempt + 1,
        maxRetries,
      });
    }
    return last ?? { success: false, error: 'Tool failed after all retries' };
  };
}
