"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { goTo } from "@/lib/navigate";
import {
  prefersReducedMotion,
  scrollToId,
  setLenis,
  targetY,
} from "@/lib/scroll";
import { loadedSignal } from "@/lib/signal";

/**
 * Global motion runtime:
 * - Lenis smooth scrolling synced to GSAP's ticker and ScrollTrigger
 * - in-page anchor interception (works without JS as plain anchors)
 * - generic [data-reveal] scroll reveals used by server-rendered sections
 */
export default function SmoothScroll() {
  useEffect(() => {
    const reduced = prefersReducedMotion();
    let lenis: Lenis | null = null;
    let tick: ((time: number) => void) | null = null;

    if (!reduced) {
      lenis = new Lenis({
        lerp: 0.085,
        wheelMultiplier: 1,
        touchMultiplier: 1.2,
        anchors: false,
      });
      lenis.on("scroll", ScrollTrigger.update);
      tick = (time: number) => lenis?.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      setLenis(lenis);
      // Hold scroll while the intro loader is on screen.
      if (!loadedSignal.get()) lenis.stop();
    }

    const unsubscribe = loadedSignal.subscribe(() => {
      if (!loadedSignal.get()) return;
      lenis?.start();
      ScrollTrigger.refresh();
      const hash = window.location.hash.slice(1);
      if (hash) requestAnimationFrame(() => scrollToId(hash));
    });

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
        return;
      const anchor = (event.target as Element | null)?.closest?.(
        "a[href^='#']",
      );
      if (!anchor) return;
      const id = anchor.getAttribute("href")?.slice(1) ?? "";
      if (!id) return;
      if (targetY(id) === null) return;
      event.preventDefault();
      goTo(id, anchor);
    };
    document.addEventListener("click", onClick);

    // Recalculate trigger positions once webfonts settle.
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => {
      unsubscribe();
      document.removeEventListener("click", onClick);
      if (tick) gsap.ticker.remove(tick);
      lenis?.destroy();
      setLenis(null);
    };
  }, []);

  return null;
}
