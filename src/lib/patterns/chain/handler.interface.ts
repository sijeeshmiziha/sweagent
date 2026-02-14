/**
 * Chain of Responsibility: handler interface.
 * Handlers are linked; each can handle the request or pass to next.
 */

export interface Handler<TRequest, TResult> {
  setNext(handler: Handler<TRequest, TResult>): Handler<TRequest, TResult>;
  handle(request: TRequest): TResult | null;
}

export interface AsyncHandler<TRequest, TResult> {
  setNext(handler: AsyncHandler<TRequest, TResult>): AsyncHandler<TRequest, TResult>;
  handle(request: TRequest): Promise<TResult | null>;
}
