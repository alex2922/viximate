"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { sceneReadySignal } from "@/lib/signal";
import type { PileScene } from "./pileScene";
import SceneFallback from "./SceneFallback";
import { readPalette, webglAvailable } from "./sceneEnv";

type HeroSceneProps = {
  onScene: (scene: PileScene | null) => void;
};

/**
 * Mounts the blocks that become the mark. three.js is code-split with a dynamic import so it never
 * blocks first paint; the flat mark stands in without WebGL.
 */
export default function HeroScene({ onScene }: HeroSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);
  const onSceneRef = useRef(onScene);
  useLayoutEffect(() => {
    onSceneRef.current = onScene;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!webglAvailable()) {
      setFailed(true);
      sceneReadySignal.set(true);
      return;
    }

    let scene: PileScene | null = null;
    let observer: IntersectionObserver | null = null;
    let cancelled = false;
    const onVisible = () => {
      if (document.hidden) scene?.stop();
      else if (canvas.getBoundingClientRect().bottom > 0) scene?.start();
    };

    (async () => {
      try {
        const { PileScene } = await import("./pileScene");
        if (cancelled) return;
        scene = new PileScene(canvas, {
          palette: readPalette(),
          reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches,
          onReady: () => sceneReadySignal.set(true),
        });
        onSceneRef.current(scene);
        observer = new IntersectionObserver(([entry]) => {
          if (entry.isIntersecting && !document.hidden) scene?.start();
          else scene?.stop();
        });
        observer.observe(canvas);
        document.addEventListener("visibilitychange", onVisible);
      } catch (error) {
        console.warn("[viximate] WebGL scene unavailable", error);
        setFailed(true);
        sceneReadySignal.set(true);
      }
    })();

    return () => {
      cancelled = true;
      observer?.disconnect();
      document.removeEventListener("visibilitychange", onVisible);
      scene?.dispose();
      onSceneRef.current(null);
    };
  }, []);

  return failed ? (
    <SceneFallback />
  ) : (
    <canvas
      ref={canvasRef}
      className="hero-canvas-el"
      role="img"
      aria-label="Glossy coloured blocks, scattered across the screen, that spiral together into the solid white Viximate mark as you scroll"
    />
  );
}
