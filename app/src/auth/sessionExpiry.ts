/**
 * Minimal, dependency-free pub/sub used to signal that the current session
 * has expired (e.g. an authenticated request came back with 401).
 *
 * Deliberately has no Redux/navigation imports so low-level modules like
 * api/client.ts can safely depend on it without coupling to app-level
 * concerns or creating circular dependencies.
 */
type Listener = () => void;

const listeners = new Set<Listener>();

export function onSessionExpired(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function notifySessionExpired(): void {
  for (const listener of listeners) {
    listener();
  }
}
