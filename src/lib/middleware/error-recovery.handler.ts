/**
 * Error recovery handler - catches errors from next handler and returns a safe result.
 */

import { AbstractAsyncHandler } from '../patterns/chain';
import type { StageRunRequest, StageRunResult } from './types';

function fallbackResult(request: StageRunRequest, error: Error): StageRunResult {
  request.logger?.error('Stage handler failed', { stage: request.stage, error });
  return {
    message: `Something went wrong: ${error.message}. Please try again.`,
    questions: request.context.pendingQuestions,
    advance: false,
    data: request.context,
  };
}

export class ErrorRecoveryHandler extends AbstractAsyncHandler<StageRunRequest, StageRunResult> {
  async handle(request: StageRunRequest): Promise<StageRunResult | null> {
    try {
      const result = await this.passToNext(request);
      return result ?? fallbackResult(request, new Error('No result from handler chain.'));
    } catch (e) {
      return fallbackResult(request, e instanceof Error ? e : new Error(String(e)));
    }
  }
}
