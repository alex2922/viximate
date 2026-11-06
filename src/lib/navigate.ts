"use client";

import { navItems, serviceBySlug, services } from "@/config/site";
import { ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion, scrollToId, targetY } from "@/lib/scroll";
import { canTransition, transitionTo } from "@/lib/transition";

/** The name the transition sheet shows for a page. */
export function labelForPath(pathname: string) {
  const path = pathname.replace(/\/+$/, "") || "/";
  const service = path.match(/^\/services\/([^/]+)$/);
  if (service) return serviceBySlug(service[1])?.title ?? "Services";
  if (path.startsWith("/blog/")) return "Blog";
  return navItems.find((item) => item.href === path)?.label ?? "Viximate";
}

/** The name the transition sheet shows for a section of the current page. */
function labelFor(id: string, anchor: Element) {
  if (id === "top") return "Home";
  const nav = navItems.find((item) => item.href.endsWith(`#${id}`));
  if (nav) return nav.label;
  const service = services.find((s) => `service-${s.id}` === id);
  if (service) return service.title;
  return (
    anchor.getAttribute("data-label") ??
    document.getElementById(id)?.querySelector("h2")?.textContent?.trim() ??
    "Viximate"
  );
}

/**
 * Go to a section. A long jump runs under the page transition; a short hop
 * (or any jump with reduced motion) just scrolls.
 */
export function goTo(id: string, anchor?: Element) {
  const y = targetY(id);
  if (y === null) return false;
  const far = Math.abs(y - window.scrollY) > window.innerHeight * 1.2;
  const write = () => {
    if (id !== "top") history.replaceState(history.state, "", `#${id}`);
    else history.replaceState(history.state, "", window.location.pathname);
  };
  if (far && canTransition() && !prefersReducedMotion()) {
    transitionTo(labelFor(id, anchor ?? document.body), () => {
      scrollToId(id, true);
      ScrollTrigger.update();
      write();
    });
  } else {
    scrollToId(id);
    write();
  }
  return true;
}

/* Route changes ---------------------------------------------------------- */

let currentPath: string | null = null;
const waiters = new Set<{ path: string; done: () => void }>();

/** Called by <RouteTransitions /> once a new page has rendered. */
export function notePath(pathname: string) {
  currentPath = pathname;
  for (const waiter of waiters) {
    if (waiter.path === pathname) {
      waiters.delete(waiter);
      waiter.done();
    }
  }
}

/** Resolves once `pathname` has rendered, or after `timeout` ms regardless. */
export function pathRendered(pathname: string, timeout = 5000) {
  if (currentPath === pathname) return Promise.resolve();
  return new Promise<void>((resolve) => {
    const waiter = {
      path: pathname,
      done: () => {
        clearTimeout(timer);
        resolve();
      },
    };
    const timer = setTimeout(() => {
      waiters.delete(waiter);
      resolve();
    }, timeout);
    waiters.add(waiter);
  });
}
