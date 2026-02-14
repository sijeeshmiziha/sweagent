/**
 * Base decorator that wraps a component and delegates by default.
 */

import type { Component } from './component.interface';

export type { Component, ToolExecutor } from './component.interface';

export abstract class BaseDecorator<
  TResult = unknown,
  TInput extends unknown[] = unknown[],
> implements Component<TResult, TInput> {
  constructor(protected readonly wrapped: Component<TResult, TInput>) {}

  execute(...args: TInput): TResult | Promise<TResult> {
    return this.wrapped.execute(...args);
  }
}
