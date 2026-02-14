/**
 * Abstract base handler for Chain of Responsibility.
 * Subclasses override handle() and either return a result or call super.handle().
 */

import type { Handler } from './handler.interface';

export type { Handler, AsyncHandler } from './handler.interface';

export abstract class AbstractHandler<TRequest, TResult> implements Handler<TRequest, TResult> {
  private nextHandler: Handler<TRequest, TResult> | null = null;

  setNext(handler: Handler<TRequest, TResult>): Handler<TRequest, TResult> {
    this.nextHandler = handler;
    return handler;
  }

  handle(request: TRequest): TResult | null {
    if (this.nextHandler) {
      return this.nextHandler.handle(request);
    }
    return null;
  }

  protected passToNext(request: TRequest): TResult | null {
    return this.nextHandler ? this.nextHandler.handle(request) : null;
  }
}
