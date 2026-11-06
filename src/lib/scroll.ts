"use client";

import type Lenis from "lenis";

let lenis: Lenis | null = null;
const targets = new Map<string, () => number>();

export function setLenis(instance: Lenis | null) {
  lenis = instance;
}

export function getLenis() {
  return lenis;
}

/**
 * Sections whose DOM position is not their scroll position (e.g. panels in a
 * pinned horizontal track) register a resolver that returns the right scrollY.
 */
export function registerScrollTarget(id: string, resolve: () => number) {
  targets.set(id, resolve);
  return () => {
    if (targets.get(id) === resolve) targets.delete(id);
  };
}

export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function resolveY(id: string): number | null {
  const resolver = targets.get(id);
  if (resolver) return resolver();
  const el = document.getElementById(id);
  if (!el) return null;
  return el.getBoundingClientRect().top + window.scrollY;
}

/** Where a section id sits, or null when there is no such section. */
export function targetY(id: string): number | null {
  const y = id === "top" ? 0 : resolveY(id);
  return y === null ? null : Math.max(0, y);
}

/**
 * Scroll to a section id, smoothly or (under a transition) at once.
 * Returns false if the target does not exist.
 */
export function scrollToId(id: string, immediate = false): boolean {
  const top = targetY(id);
  if (top === null) return false;
  if (lenis) {
    lenis.scrollTo(
      top,
      immediate
        ? { immediate: true, force: true }
        : { duration: 1.6, force: true },
    );
  } else {
    window.scrollTo({
      top,
      behavior: immediate || prefersReducedMotion() ? "auto" : "smooth",
    });
  }
  const el = id === "top" ? null : document.getElementById(id);
  if (el) {
    if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
    el.focus({ preventScroll: true });
  }
  return true;
}
