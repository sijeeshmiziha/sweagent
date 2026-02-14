/**
 * State pattern interfaces.
 * Context holds current state; state handles requests and can transition context.
 */

/** Input passed to a state's process method */
export type ProcessInput = Record<string, unknown>;

/** Result from processing in a state */
export interface StageResult<TData = unknown> {
  message: string;
  advance: boolean;
  data: TData;
  questions?: unknown[];
}

/** State interface: process request and optionally transition context to another state */
export interface IState<TContext, TInput = ProcessInput, TData = unknown> {
  /** Process the request in this state. May transition context via context.transitionTo(). */
  process(context: TContext, input: TInput): Promise<StageResult<TData>>;
  /** Whether the context can advance to the next state after this run */
  canAdvance(result: StageResult<TData>): boolean;
  /** Next state type or null if terminal */
  getNextState(): IState<TContext, TInput, TData> | null;
}

/** Context that holds current state and allows transitions */
export interface IStateContext<TContext, TState extends IState<TContext>> {
  transitionTo(state: TState): void;
  getState(): TState;
}
