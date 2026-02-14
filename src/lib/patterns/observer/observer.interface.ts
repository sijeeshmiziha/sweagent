/**
 * Observer pattern: subject notifies observers of events.
 */

export interface Observer<TSubject = unknown> {
  update(subject: TSubject): void;
}

export interface Subject<TSubject = unknown> {
  attach(observer: Observer<TSubject>): void;
  detach(observer: Observer<TSubject>): void;
  notify(): void;
}

/** Agent-specific observer for stage/tool events */
export interface AgentObserver {
  onStageChange?(stage: string, context: unknown): void;
  onToolExecution?(tool: string, result: unknown): void;
  onError?(error: Error): void;
}
