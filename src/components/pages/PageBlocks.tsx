"use client";

import { useEffect, useRef } from "react";
import type { PileScene } from "@/components/hero/pileScene";
import { readPalette, webglAvailable } from "@/components/hero/sceneEnv";
import { FIGURES, type FigureId } from "@/config/figures";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { loadedSignal } from "@/lib/signal";

type PageBlocksProps = {
  /** What the blocks build. Left out, they build the mark. */
  figure?: FigureId;
  /** They never come together: the 404. */
  loose?: boolean;
  /** The figure sits further down than one screen, so scrolling leaves it be. */
  steady?: boolean;
};

/**
 * The hero's blocks at the top of an inner page. They fall in, build the
 * page's figure inside the [data-blocks-frame] box, come apart as you scroll
 * away, and a press on the figure knocks it down so it can rebuild itself.
 * The flat art in the box stays until this has a scene, so no WebGL, no
 * script and reduced motion all still show the finished shape.
 */
export default function PageBlocks({
  figure,
  loose = false,
  steady = false,
}: PageBlocksProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.closest<HTMLElement>("[data-blocks]");
    const box = host?.querySelector<HTMLElement>("[data-blocks-frame]");
    if (!canvas || !host || !box || !webglAvailable()) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced && loose) return;

    host.dataset.blocksReady = "";
    let scene: PileScene | null = null;
    let cancelled = false;
    let stopLoad: (() => void) | undefined;
    let trigger: ScrollTrigger | undefined;
    let observer: IntersectionObserver | undefined;
    const state = { built: 0, apart: 0 };
    const apply = () => scene?.setAssembly(state.built * (1 - state.apart));

    const knock = () => {
      if (!scene || state.built < 0.9) return;
      scene.shatter();
      gsap.killTweensOf(state, "built");
      gsap
        .timeline({ onUpdate: apply })
        .to(state, { built: 0, duration: 0.3, ease: "power2.out" })
        .to(state, { built: 1, duration: 2, ease: "none" }, "+=1.3");
    };

    const begin = () => {
      scene?.drop();
      if (reduced || loose) return;
      gsap.to(state, {
        built: 1,
        duration: 2.2,
        delay: 0.7,
        ease: "none",
        onUpdate: apply,
      });
      if (!steady) {
        trigger = ScrollTrigger.create({
          trigger: host,
          start: "top top",
          end: () =>
            `+=${Math.min(host.offsetHeight, window.innerHeight) * 0.8}`,
          scrub: 0.4,
          onUpdate: (self) => {
            state.apart = self.progress;
            apply();
          },
        });
      }
      box.addEventListener("pointerdown", knock);
    };

    (async () => {
      try {
        const { PileScene } = await import("@/components/hero/pileScene");
        if (cancelled) return;
        scene = new PileScene(canvas, {
          palette: readPalette(),
          reducedMotion: reduced,
          pointerTarget: host,
          figure: figure
            ? { bits: FIGURES[figure], tone: getComputedStyle(box).color }
            : undefined,
          frame: () => {
            const c = canvas.getBoundingClientRect();
            const b = box.getBoundingClientRect();
            return {
              x: b.left - c.left,
              y: b.top - c.top,
              width: b.width,
              height: b.height,
            };
          },
        });
        const live = scene;
        observer = new IntersectionObserver(([entry]) => {
          if (entry.isIntersecting) live.start();
          else live.stop();
        });
        observer.observe(canvas);
        if (loadedSignal.get()) begin();
        else {
          stopLoad = loadedSignal.subscribe(() => {
            if (!loadedSignal.get()) return;
            stopLoad?.();
            begin();
          });
        }
      } catch (error) {
        console.warn("[viximate] WebGL scene unavailable", error);
        delete host.dataset.blocksReady;
      }
    })();

    return () => {
      cancelled = true;
      stopLoad?.();
      trigger?.kill();
      observer?.disconnect();
      gsap.killTweensOf(state);
      box.removeEventListener("pointerdown", knock);
      scene?.dispose();
      delete host.dataset.blocksReady;
    };
  }, [figure, loose, steady]);

  return <canvas ref={canvasRef} className="page-blocks" />;
}
