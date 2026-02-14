/**
 * Logging decorator for tool execution - logs before and after execution.
 */

import type { ToolSet, ExecuteToolOptions } from '../tools/tools';
import type { ToolExecutionResult } from '../types/tool';

export type ToolExecutorFn = (
  tools: ToolSet,
  name: string,
  input: unknown,
  options?: ExecuteToolOptions
) => Promise<ToolExecutionResult>;

export function withLogging(executor: ToolExecutorFn): ToolExecutorFn {
  return async function loggingExecutor(
    tools: ToolSet,
    name: string,
    input: unknown,
    options?: ExecuteToolOptions
  ): Promise<ToolExecutionResult> {
    const logger = options?.logger;
    logger?.debug('Tool execution start', { name, toolCallId: options?.toolCallId });
    const start = Date.now();
    const result = await executor(tools, name, input, options);
    const duration = Date.now() - start;
    logger?.debug('Tool execution end', {
      name,
      success: result.success,
      durationMs: duration,
      toolCallId: options?.toolCallId,
    });
    return result;
  };
}
