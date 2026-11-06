"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import { goTo, labelForPath, notePath, pathRendered } from "@/lib/navigate";
import { prefersReducedMotion, scrollToId, targetY } from "@/lib/scroll";
import { canTransition, transitionTo } from "@/lib/transition";

const frames = (n: number) =>
  new Promise<void>((resolve) => {
    const step = (left: number) =>
      left <= 0 ? resolve() : requestAnimationFrame(() => step(left - 1));
    step(n);
  });

/** An internal link this site should route itself, or null. */
function internalUrl(event: MouseEvent) {
  if (event.defaultPrevented || event.button !== 0) return null;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
    return null;
  const anchor = (event.target as Element | null)?.closest?.("a[href]");
  if (!(anchor instanceof HTMLAnchorElement)) return null;
  if (anchor.target && anchor.target !== "_self") return null;
  if (anchor.hasAttribute("download")) return null;
  // Bare #hash links are in-page jumps, handled by <SmoothScroll />.
  if (anchor.getAttribute("href")?.startsWith("#")) return null;
  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin) return null;
  return { url, anchor };
}

/**
 * Every move between pages runs under the transition sheet: cover, swap the
 * page while covered, land at the top (or at the linked section), uncover.
 * Links stay plain anchors, so they work before hydration and without script.
 */
export default function RouteTransitions() {
  const router = useRouter();
  const pathname = usePathname();

  // A page rendered: tell anything waiting on it, then re-measure triggers.
  useEffect(() => {
    notePath(pathname);
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const hit = internalUrl(event);
      if (!hit) return;
      const { url, anchor } = hit;
      const hash = decodeURIComponent(url.hash.slice(1));

      // Same page: a section jump, or back to the top.
      if (url.pathname === window.location.pathname) {
        if (url.search !== window.location.search) return;
        const id = hash || "top";
        if (targetY(id) === null) return;
        event.preventDefault();
        goTo(id, anchor);
        return;
      }

      // Another page. Stop here so no other handler navigates as well.
      event.preventDefault();
      event.stopPropagation();
      const href = `${url.pathname}${url.search}${url.hash}`;
      const swap = async () => {
        router.push(href, { scroll: false });
        await pathRendered(url.pathname);
        await frames(2);
        ScrollTrigger.refresh();
        if (!(hash && scrollToId(hash, true))) {
          scrollToId("top", true);
          document.getElementById("main")?.focus({ preventScroll: true });
        }
        ScrollTrigger.update();
      };
      if (prefersReducedMotion() || !canTransition()) {
        void swap();
        return;
      }
      void transitionTo(labelForPath(url.pathname), swap);
    };

    // Warm the next page as soon as a pointer settles on its link.
    const onOver = (event: PointerEvent) => {
      const anchor = (event.target as Element | null)?.closest?.("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.getAttribute("href")?.startsWith("#")) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) return;
      router.prefetch(url.pathname + url.search);
    };

    document.addEventListener("click", onClick, true);
    document.addEventListener("pointerover", onOver, { passive: true });
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("pointerover", onOver);
    };
  }, [router]);

  return null;
}
