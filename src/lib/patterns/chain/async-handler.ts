/**
 * Abstract async handler for Chain of Responsibility.
 */

import type { AsyncHandler } from './handler.interface';

export abstract class AbstractAsyncHandler<TRequest, TResult> implements AsyncHandler<
  TRequest,
  TResult
> {
  private nextHandler: AsyncHandler<TRequest, TResult> | null = null;

  setNext(handler: AsyncHandler<TRequest, TResult>): AsyncHandler<TRequest, TResult> {
    this.nextHandler = handler;
    return handler;
  }

  async handle(request: TRequest): Promise<TResult | null> {
    if (this.nextHandler) {
      return this.nextHandler.handle(request);
    }
    return null;
  }

  protected async passToNext(request: TRequest): Promise<TResult | null> {
    return this.nextHandler ? this.nextHandler.handle(request) : null;
  }
}
