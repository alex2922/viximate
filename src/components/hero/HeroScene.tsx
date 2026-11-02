"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { services } from "@/config/site";
import { sceneReadySignal } from "@/lib/signal";
import type { EcosystemScene, ScenePalette } from "./ecosystemScene";
import SceneFallback from "./SceneFallback";

type HeroSceneProps = {
  onScene: (scene: EcosystemScene | null) => void;
  onHover: (index: number | null) => void;
  onSelect: (index: number) => void;
};

function readPalette(): ScenePalette {
  const css = getComputedStyle(document.documentElement);
  const v = (name: string) => css.getPropertyValue(name).trim();
  return {
    accent: v("--cs-accent"),
    accent2: v("--cs-accent-2"),
    foreground: v("--cs-foreground"),
    background: v("--cs-background"),
    muted: v("--cs-muted"),
    fontMono: v("--cs-font-accent") || "monospace",
    fontSans: v("--cs-font-body") || "sans-serif",
  };
}

function webglAvailable() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Mounts the WebGL ecosystem. three.js is code-split via dynamic import so it
 * never blocks first paint; a static SVG composition stands in if WebGL is
 * unavailable.
 */
export default function HeroScene({
  onScene,
  onHover,
  onSelect,
}: HeroSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);
  const handlers = useRef({ onScene, onHover, onSelect });
  useLayoutEffect(() => {
    handlers.current = { onScene, onHover, onSelect };
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!webglAvailable()) {
      setFailed(true);
      sceneReadySignal.set(true);
      return;
    }

    let scene: EcosystemScene | null = null;
    let observer: IntersectionObserver | null = null;
    let cancelled = false;

    (async () => {
      try {
        const [{ EcosystemScene }] = await Promise.all([
          import("./ecosystemScene"),
          document.fonts?.ready,
        ]);
        if (cancelled) return;
        const reducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        scene = new EcosystemScene(canvas, {
          palette: readPalette(),
          reducedMotion,
          panels: services.map((s) => ({
            kind: s.id,
            index: s.index,
            title: s.short,
            tone: s.tone,
          })),
          onHover: (i) => handlers.current.onHover(i),
          onSelect: (i) => handlers.current.onSelect(i),
          onReady: () => sceneReadySignal.set(true),
        });
        handlers.current.onScene(scene);

        observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting && !document.hidden) scene?.start();
            else scene?.stop();
          },
          { threshold: 0 },
        );
        observer.observe(canvas);

        const onVisible = () => {
          if (!document.hidden && canvas.getBoundingClientRect().bottom > 0)
            scene?.start();
        };
        document.addEventListener("visibilitychange", onVisible);
        const prevDispose = scene.dispose.bind(scene);
        scene.dispose = () => {
          document.removeEventListener("visibilitychange", onVisible);
          prevDispose();
        };
      } catch (error) {
        console.warn("[viximate] WebGL scene unavailable", error);
        setFailed(true);
        sceneReadySignal.set(true);
      }
    })();

    return () => {
      cancelled = true;
      observer?.disconnect();
      scene?.dispose();
      handlers.current.onScene(null);
    };
  }, []);

  return (
    <div className="absolute inset-0">
      {failed ? (
        <SceneFallback />
      ) : (
        <canvas
          ref={canvasRef}
          className="h-full w-full touch-pan-y"
          aria-label="Interactive 3D network connecting Viximate's four services: web, apps, automation & AI, and growth"
          role="img"
        />
      )}
    </div>
  );
}
