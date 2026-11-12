/**
 * Typing fix (Stage A): the dashboard waits TYPING_PAUSE_MS after the last key before asking the
 * server, and keeps only the reply to the newest request. A reply to an older value (it can arrive
 * late) is ignored, so the screen never flips back to an old figure.
 */
export const TYPING_PAUSE_MS = 400;

/** A counter: next() starts a request and returns its number; isCurrent(n) is true only for the newest. */
export function makeLatest() {
  let n = 0;
  return {
    next: () => { n += 1; return n; },
    isCurrent: (id) => id === n
  };
}
