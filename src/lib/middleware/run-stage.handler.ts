/**
 * Terminal handler that runs a stage runner function (injected to avoid circular deps).
 */

import { AbstractAsyncHandler } from '../patterns/chain';
import type { StageRunRequest, StageRunResult } from './types';

export type StageRunnerFn = (request: StageRunRequest) => Promise<StageRunResult>;

export class RunStageHandler extends AbstractAsyncHandler<StageRunRequest, StageRunResult> {
  constructor(private readonly run: StageRunnerFn) {
    super();
  }

  async handle(request: StageRunRequest): Promise<StageRunResult | null> {
    return this.run(request);
  }
}
