/**
 * Decorator pattern: component interface that decorators wrap.
 */

export interface Component<TResult = unknown, TInput extends unknown[] = unknown[]> {
  /** Operation that can be wrapped by decorators */
  execute(...args: TInput): TResult | Promise<TResult>;
}

/** Tool execution: (tool, args) => result */
export interface ToolExecutor {
  execute(
    tool: { name: string; execute: (args: unknown) => Promise<unknown> },
    args: unknown
  ): Promise<unknown>;
}
