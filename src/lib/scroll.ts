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

/** Smoothly scroll to a section id. Returns false if the target does not exist. */
export function scrollToId(id: string): boolean {
  const y = id === "top" ? 0 : resolveY(id);
  if (y === null) return false;
  const top = Math.max(0, y);
  if (lenis) {
    lenis.scrollTo(top, { duration: 1.6, force: true });
  } else {
    window.scrollTo({
      top,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }
  const el = id === "top" ? null : document.getElementById(id);
  if (el) {
    if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
    el.focus({ preventScroll: true });
  }
  return true;
}
