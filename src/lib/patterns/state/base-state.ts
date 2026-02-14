/**
 * Abstract base for State pattern.
 * Subclasses implement process(), canAdvance(), getNextState().
 */

import type { IState, ProcessInput, StageResult } from './state.interface';

export type { IState, ProcessInput, StageResult } from './state.interface';

export abstract class BaseState<TContext, TInput = ProcessInput, TData = unknown> implements IState<
  TContext,
  TInput,
  TData
> {
  abstract process(context: TContext, input: TInput): Promise<StageResult<TData>>;
  abstract canAdvance(result: StageResult<TData>): boolean;
  abstract getNextState(): IState<TContext, TInput, TData> | null;
}
