"use client";

import { useRef } from "react";
import { MARK_CHEVRON, MARK_TOP, MARK_VIEWBOX } from "@/config/brand";
import { gsap, useGSAP } from "@/lib/gsap";
import { loadedSignal, sceneReadySignal } from "@/lib/signal";

const MIN_DURATION = 2;
const MAX_WAIT = 4.5;

const { width: W, height: H } = MARK_VIEWBOX;
const CREST = 26;
const LEVEL_EMPTY = H + CREST * 2;
const LEVEL_FULL = -CREST * 2;

/** A wave two lengths wider than the mark, so it can slide and loop. */
const WAVE = `M${-W} 0 q${W / 8} ${-CREST} ${W / 4} 0 t${` ${W / 4} 0`.repeat(11)} V${H * 2} H${-W} Z`;

/** Intro: the mark fills with water. Nothing else. */
const SiteLoader = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const waterRef = useRef<SVGGElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      const water = waterRef.current;
      if (!root || !water) return;
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      let finished = false;

      gsap.set(water, { y: LEVEL_EMPTY });
      const rise = gsap.to(water, {
        y: LEVEL_EMPTY + (LEVEL_FULL - LEVEL_EMPTY) * 0.86,
        duration: reduced ? 0 : MIN_DURATION,
        ease: "power1.inOut",
      });

      const finish = () => {
        if (finished) return;
        finished = true;
        rise.kill();
        gsap
          .timeline({
            onComplete: () => {
              root.style.display = "none";
            },
          })
          .to(water, {
            y: LEVEL_FULL,
            duration: reduced ? 0 : 0.5,
            ease: "power2.out",
          })
          .add(
            () => {
              document.documentElement.classList.add("is-loaded");
              loadedSignal.set(true);
            },
            reduced ? 0 : "+=0.15",
          )
          .to(
            root,
            reduced
              ? { autoAlpha: 0, duration: 0.25 }
              : { yPercent: -100, duration: 0.9, ease: "expo.inOut" },
          );
      };

      const fontsReady = document.fonts?.ready ?? Promise.resolve();
      // Only the home page has a scene to wait for.
      const hasScene = Boolean(document.querySelector(".hero-canvas"));
      const sceneReady = new Promise<void>((resolve) => {
        if (!hasScene || sceneReadySignal.get()) return resolve();
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
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="vx-loader-mark"
        aria-hidden="true"
      >
        <defs>
          <clipPath id="vx-loader-clip">
            <path d={MARK_TOP} />
            <path d={MARK_CHEVRON} />
          </clipPath>
        </defs>
        <g clipPath="url(#vx-loader-clip)">
          <rect width={W} height={H} className="vx-loader-empty" />
          <g ref={waterRef}>
            <path d={WAVE} className="vx-loader-wave vx-loader-wave--back" />
            <path d={WAVE} className="vx-loader-wave" />
          </g>
        </g>
      </svg>
    </div>
  );
};

export default SiteLoader;
