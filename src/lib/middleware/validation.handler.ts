/**
 * Validation handler for stage run chain - validates request before passing to next.
 */

import { AbstractAsyncHandler } from '../patterns/chain';
import type { StageRunRequest, StageRunResult } from './types';

const VALID_STAGES = ['discovery', 'requirements', 'design', 'complete'] as const;

function isValidStage(s: string): s is StageRunRequest['stage'] {
  return VALID_STAGES.includes(s as (typeof VALID_STAGES)[number]);
}

function failResult(request: StageRunRequest, message: string): StageRunResult {
  return {
    message,
    questions: request.context.pendingQuestions,
    advance: false,
    data: request.context,
  };
}

export class ValidationHandler extends AbstractAsyncHandler<StageRunRequest, StageRunResult> {
  async handle(request: StageRunRequest): Promise<StageRunResult | null> {
    if (!request.context) {
      return failResult(request, 'Context is required.');
    }
    if (!request.model) {
      return failResult(request, 'Model is required.');
    }
    if (typeof request.userMessage !== 'string') {
      return failResult(request, 'User message must be a string.');
    }
    if (!isValidStage(request.stage)) {
      return failResult(request, `Invalid stage: ${request.stage}.`);
    }
    const nextResult = await this.passToNext(request);
    return nextResult ?? failResult(request, 'No handler could process the request.');
  }
}
