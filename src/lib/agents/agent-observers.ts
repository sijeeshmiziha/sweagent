/**
 * Notify agent observers (step, tool, error). Keeps agent.ts under 150 lines.
 */

import type { AgentObserver, AgentStep } from '../types/agent';

export function notifyObserversStep(observers: AgentObserver[] | undefined, step: AgentStep): void {
  observers?.forEach(o => o.onStep?.(step));
}

export function notifyObserversTool(
  observers: AgentObserver[] | undefined,
  toolName: string,
  result: unknown
): void {
  observers?.forEach(o => o.onToolExecution?.(toolName, result));
}

export function notifyObserversError(observers: AgentObserver[] | undefined, error: Error): void {
  observers?.forEach(o => o.onError?.(error));
}
