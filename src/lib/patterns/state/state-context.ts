/**
 * Generic context that holds current state and allows transitions.
 * Use with BaseState subclasses for State pattern.
 */

import type { IState } from './state.interface';

export interface StateContext<TContext, TState extends IState<TContext>> {
  getState(): TState;
  transitionTo(state: TState): void;
}

export function createStateContext<TContext, TState extends IState<TContext>>(
  initialState: TState,
  onTransition?: (from: TState | null, to: TState) => void
): StateContext<TContext, TState> {
  let current: TState = initialState;
  return {
    getState(): TState {
      return current;
    },
    transitionTo(state: TState): void {
      const prev = current;
      current = state;
      onTransition?.(prev, state);
    },
  };
}
