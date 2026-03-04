/**
 * Notify agent observers (step, tool, error, budget).
 */

import type { AgentObserver, AgentStep } from '../types/agent';
import type { LanguageModelUsage } from '../types/model';

export function notifyObserversStep(
  observers: AgentObserver[] | undefined,
  step: AgentStep,
  cumulativeUsage?: LanguageModelUsage
): void {
  observers?.forEach(o => o.onStep?.(step, cumulativeUsage));
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

export function notifyObserversBudgetWarning(
  observers: AgentObserver[] | undefined,
  used: number,
  budget: number
): void {
  observers?.forEach(o => o.onTokenBudgetWarning?.(used, budget));
}
