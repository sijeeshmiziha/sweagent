/**
 * In-memory store for proposed outputs before finalization.
 * Adapted from redxpilot's proposed-content-store.
 *
 * Keyed by runId + artifact name so multiple proposals can coexist.
 * Consumers call propose() to store a draft, then finalize() to commit it.
 */

export interface ProposedEntry<T = unknown> {
  artifact: string;
  data: T;
  proposedAt: number;
}

const store = new Map<string, Map<string, ProposedEntry>>();

function key(runId: string): Map<string, ProposedEntry> {
  let entries = store.get(runId);
  if (!entries) {
    entries = new Map();
    store.set(runId, entries);
  }
  return entries;
}

/**
 * Store a proposed artifact for later review/finalization.
 */
export function propose<T>(runId: string, artifact: string, data: T): ProposedEntry<T> {
  const entry: ProposedEntry<T> = { artifact, data, proposedAt: Date.now() };
  key(runId).set(artifact, entry as ProposedEntry);
  return entry;
}

/**
 * Retrieve a proposed artifact (returns undefined if not found).
 */
export function getProposed<T = unknown>(
  runId: string,
  artifact: string
): ProposedEntry<T> | undefined {
  return key(runId).get(artifact) as ProposedEntry<T> | undefined;
}

/**
 * List all proposed artifacts for a run.
 */
export function listProposed(runId: string): ProposedEntry[] {
  return Array.from(key(runId).values());
}

/**
 * Finalize: remove from proposed store and return the data.
 * Returns undefined if not found.
 */
export function finalize(runId: string, artifact: string): unknown | undefined {
  const entries = key(runId);
  const entry = entries.get(artifact);
  if (entry) entries.delete(artifact);
  return entry?.data;
}

/**
 * Discard a proposal without finalizing.
 */
export function discard(runId: string, artifact: string): boolean {
  return key(runId).delete(artifact);
}

/**
 * Clear all proposals for a run (cleanup after run completes).
 */
export function clearRun(runId: string): void {
  store.delete(runId);
}
