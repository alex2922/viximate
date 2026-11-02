"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { loadedSignal, sceneReadySignal } from "@/lib/signal";
import NumCounter from "../numCounter/NumCounter";

const COLUMNS = 5;
const MIN_DURATION = 1.6;
const MAX_WAIT = 4.5;

/**
 * Intro loader: counts to 100 while fonts + the hero scene warm up,
 * then wipes away in staggered columns and releases the page.
 */
const SiteLoader = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const state = { value: 0 };
      let finished = false;

      const render = () => {
        if (counterRef.current) {
          counterRef.current.textContent = String(
            Math.round(state.value),
          ).padStart(3, "0");
        }
        if (barRef.current)
          barRef.current.style.transform = `scaleX(${state.value / 100})`;
      };

      const finish = () => {
        if (finished) return;
        finished = true;
        gsap.killTweensOf(state);
        const tl = gsap.timeline({
          onComplete: () => {
            root.style.display = "none";
          },
        });
        tl.to(state, {
          value: 100,
          duration: reduced ? 0 : 0.35,
          ease: "power2.out",
          onUpdate: render,
        })
          .add(() => {
            document.documentElement.classList.add("is-loaded");
            loadedSignal.set(true);
          })
          .to(
            ".vx-loader-meta",
            { autoAlpha: 0, y: -16, duration: 0.4, ease: "power2.in" },
            "<",
          )
          .to(
            ".vx-loader-col",
            reduced
              ? { autoAlpha: 0, duration: 0.3 }
              : {
                  yPercent: -100,
                  duration: 1,
                  ease: "expo.inOut",
                  stagger: 0.06,
                },
            "-=0.15",
          );
      };

      // Creep toward 90 while assets load; the last stretch waits for readiness.
      gsap.to(state, {
        value: 90,
        duration: MIN_DURATION,
        ease: "power1.inOut",
        onUpdate: render,
      });

      const fontsReady = document.fonts?.ready ?? Promise.resolve();
      const sceneReady = new Promise<void>((resolve) => {
        if (sceneReadySignal.get()) return resolve();
        const off = sceneReadySignal.subscribe(() => {
          if (sceneReadySignal.get()) {
            off();
            resolve();
          }
        });
      });
      const minTime = new Promise((r) =>
        setTimeout(r, reduced ? 200 : MIN_DURATION * 1000),
      );
      const maxTime = new Promise((r) => setTimeout(r, MAX_WAIT * 1000));

      Promise.race([
        Promise.all([fontsReady, sceneReady, minTime]),
        maxTime,
      ]).then(finish);
    },
    { scope: rootRef },
  );

  return (
    // biome-ignore lint/a11y/useSemanticElements: full-screen overlay, <output> is not appropriate
    <div
      ref={rootRef}
      className="vx-loader"
      role="status"
      aria-live="polite"
      aria-label="Loading Viximate"
    >
      {Array.from({ length: COLUMNS }, (_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static decorative columns
        <div key={i} className="vx-loader-col" />
      ))}
      <div className="vx-loader-meta pointer-events-none absolute inset-0 flex flex-col justify-between p-[var(--cs-gutter)]">
        <div className="flex items-center justify-between">
          <span className="caption">Viximate</span>
          <span className="caption text-muted">Booting ecosystem</span>
        </div>
        <div>
          <div className="flex items-end justify-between gap-6">
            <span className="caption text-muted max-w-[16rem]">
              Web · Apps · Automation &amp; AI · Growth
            </span>
            <span className="h1 wide leading-none text-cs-foreground">
              <NumCounter ref={counterRef} />
            </span>
          </div>
          <div className="mt-6 h-px w-full bg-cs-line">
            <div
              ref={barRef}
              className="h-full w-full origin-left bg-cs-accent"
              style={{ transform: "scaleX(0)" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteLoader;
