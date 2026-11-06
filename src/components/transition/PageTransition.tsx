"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { type Jump, registerTransition } from "@/lib/transition";

/** A sheet edge: flat at 0, bowed by `bow` percent of the curve's height. */
const edge = (bow: number, side: "top" | "bottom") =>
  side === "top"
    ? `M0 100 L0 100 Q50 ${100 - bow} 100 100 L100 100 Z`
    : `M0 0 L0 0 Q50 ${bow} 100 0 L100 0 Z`;

/**
 * The page transition: a lavender sheet rises from below with a bowed
 * leading edge, names where you are going, and lifts away with its trailing
 * edge bowed the other way. The jump happens while the page is covered.
 */
export default function PageTransition() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const sheet = root.querySelector<HTMLElement>(".vx-tr-sheet");
    const top = root.querySelector<SVGPathElement>(".vx-tr-edge--top path");
    const bottom = root.querySelector<SVGPathElement>(
      ".vx-tr-edge--bottom path",
    );
    const label = root.querySelector<HTMLElement>(".vx-tr-label-text");
    const dim = root.querySelector<HTMLElement>(".vx-tr-dim");
    if (!sheet || !top || !bottom || !label || !dim) return;

    registerTransition(
      (text: string, jump: Jump) =>
        new Promise<void>((resolve) => {
          if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            Promise.resolve(jump()).finally(resolve);
            return;
          }
          label.textContent = text;
          const bow = { top: 100, bottom: 0 };
          const draw = () => {
            top.setAttribute("d", edge(bow.top, "top"));
            bottom.setAttribute("d", edge(bow.bottom, "bottom"));
          };
          draw();
          gsap.set(root, { visibility: "visible" });
          gsap.set(sheet, { yPercent: 130 });
          gsap.set(label, { yPercent: 110 });
          const tl = gsap.timeline({
            onComplete: () => {
              gsap.set(root, { visibility: "hidden" });
              resolve();
            },
          });
          tl
            // Cover: the outgoing page dims, the sheet rises, its edge settles.
            .to(dim, { opacity: 1, duration: 0.6, ease: "power2.out" }, 0)
            .to(sheet, { yPercent: 0, duration: 0.75, ease: "expo.inOut" }, 0)
            .to(
              bow,
              { top: 0, duration: 0.75, ease: "power3.out", onUpdate: draw },
              0.1,
            )
            // The name rises on its own clock, so a slow page load never
            // freezes it halfway.
            .add(() => {
              gsap.to(label, { yPercent: 0, duration: 0.6, ease: "expo.out" });
            }, 0.45)
            // Covered: hold here until the jump (a scroll or a new page) is done.
            .addPause(0.8, () => {
              Promise.resolve(jump())
                .catch(() => {})
                .then(() => {
                  dim.style.opacity = "0";
                  tl.resume();
                });
            })
            // Uncover: the name leaves, the sheet lifts, its tail bows.
            .to(
              label,
              { yPercent: -110, duration: 0.45, ease: "expo.in" },
              1.05,
            )
            .to(
              sheet,
              { yPercent: -130, duration: 0.85, ease: "expo.inOut" },
              1.2,
            )
            .to(
              bow,
              { bottom: 100, duration: 0.5, ease: "power2.in", onUpdate: draw },
              1.2,
            );
        }),
    );
    return () => registerTransition(null);
  }, []);

  return (
    <div ref={rootRef} className="vx-tr" aria-hidden="true">
      <div className="vx-tr-dim" />
      <div className="vx-tr-sheet">
        <svg
          className="vx-tr-edge vx-tr-edge--top"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d={edge(100, "top")} />
        </svg>
        <div className="vx-tr-label">
          <span className="vx-tr-label-text" />
        </div>
        <svg
          className="vx-tr-edge vx-tr-edge--bottom"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d={edge(0, "bottom")} />
        </svg>
      </div>
    </div>
  );
}
