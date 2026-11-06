"use client";

/**
 * Page transitions. <PageTransition /> registers the runner; anything that
 * moves the visitor to another part of the site calls transitionTo(), which
 * covers the page, runs the jump while covered, then uncovers it.
 */
export type Jump = () => void | Promise<void>;
type Runner = (label: string, jump: Jump) => Promise<void>;

let runner: Runner | null = null;
let busy = false;

export function registerTransition(fn: Runner | null) {
  runner = fn;
}

export function canTransition() {
  return Boolean(runner) && !busy;
}

export async function transitionTo(label: string, jump: Jump) {
  if (!runner || busy) {
    await jump();
    return;
  }
  busy = true;
  try {
    await runner(label, jump);
  } finally {
    busy = false;
  }
}
