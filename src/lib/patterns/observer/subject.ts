/**
 * Generic subject that holds observers and notifies on demand.
 */

import type { Observer, Subject as ISubject } from './observer.interface';

export type { Observer, Subject as ISubject, AgentObserver } from './observer.interface';

export class Subject<TState = unknown> implements ISubject<TState> {
  private observers: Observer<TState>[] = [];

  constructor(private getState: () => TState) {}

  attach(observer: Observer<TState>): void {
    if (this.observers.includes(observer)) return;
    this.observers.push(observer);
  }

  detach(observer: Observer<TState>): void {
    const i = this.observers.indexOf(observer);
    if (i !== -1) this.observers.splice(i, 1);
  }

  notify(): void {
    const state = this.getState();
    for (const observer of this.observers) {
      observer.update(state);
    }
  }
}
