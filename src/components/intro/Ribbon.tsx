"use client";

import { useEffect, useRef } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import type { PathFor, RibbonScene } from "./ribbonScene";

/**
 * The ribbon that threads the About section. Its path is measured from the
 * text around it, so the tube loops through the empty column and slips
 * through the gap under the title without ever crossing a word. three.js
 * loads only when the section comes near; the tube draws with the scroll,
 * or sits fully drawn when motion is reduced.
 */
export default function Ribbon() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = canvas?.closest<HTMLElement>(".intro-stage");
    if (!canvas || !stage) return;
    const title = stage.querySelector<HTMLElement>(".intro-title");
    const statement = stage.querySelector<HTMLElement>(".intro-statement");
    const spacer = stage.querySelector<HTMLElement>(".intro-ribbon");
    if (!title || !statement || !spacer) return;

    let scene: RibbonScene | null = null;
    let trigger: ScrollTrigger | null = null;
    let resize: ResizeObserver | null = null;
    let cancelled = false;

    const pathFor: PathFor = (w) => {
      const c = canvas.getBoundingClientRect();
      const t = title.getBoundingClientRect();
      const s = statement.getBoundingClientRect();
      const top = s.top - c.top;
      const h = s.height;
      const gap = (t.bottom + s.top) / 2 - c.top;

      if (s.left - c.left > w * 0.3) {
        // Wide: a loop in the empty left column, then out along the gap.
        const L = s.left - c.left - 24;
        return [
          [-40, top + h * 1.05, 0],
          [L * 0.32, top + h * 0.72, 0.6],
          [L * 0.72, top + h * 0.9, -0.2],
          [L * 0.86, top + h * 0.5, 0.4],
          [L * 0.5, top + h * 0.22, -0.5],
          [L * 0.22, top + h * 0.42, 0.2],
          [L * 0.4, top + h * 0.62, 0.8],
          [L * 0.78, gap + 4, 0],
          [L + (w - L) * 0.45, gap - 2, -0.4],
          [w + 60, gap - 18, 0],
        ];
      }

      // Narrow: a loop in the spacer between the title and the statement.
      const r = spacer.getBoundingClientRect();
      const y = (v: number) => r.top - c.top + r.height * v;
      return [
        [-40, y(0.62), 0],
        [w * 0.24, y(0.24), 0.5],
        [w * 0.52, y(0.6), -0.3],
        [w * 0.42, y(0.9), 0.6],
        [w * 0.28, y(0.6), 0],
        [w * 0.58, y(0.22), -0.4],
        [w * 0.84, y(0.52), 0.3],
        [w + 60, y(0.36), 0],
      ];
    };

    const mount = async () => {
      try {
        const probe = document.createElement("canvas");
        if (!(probe.getContext("webgl2") ?? probe.getContext("webgl"))) return;
        const { RibbonScene } = await import("./ribbonScene");
        if (cancelled) return;
        const css = getComputedStyle(document.documentElement);
        scene = new RibbonScene(
          canvas,
          {
            tones: [
              css.getPropertyValue("--cs-disc-growth").trim(),
              css.getPropertyValue("--cs-disc-ai").trim(),
              css.getPropertyValue("--cs-disc-app").trim(),
              css.getPropertyValue("--cs-disc-web").trim(),
            ],
          },
          pathFor,
        );
        // Text reflows (fonts, width): rebuild the tube around it.
        resize = new ResizeObserver(() => scene?.resize());
        resize.observe(statement);
        resize.observe(title);
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          scene.setProgress(1);
          return;
        }
        trigger = ScrollTrigger.create({
          trigger: stage,
          start: "top 80%",
          end: "bottom 55%",
          scrub: 0.6,
          onUpdate: (self) => scene?.setProgress(self.progress),
        });
        scene.setProgress(trigger.progress);
      } catch (error) {
        console.warn("[viximate] ribbon unavailable", error);
      }
    };

    const near = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        near.disconnect();
        mount();
      },
      { rootMargin: "50% 0px" },
    );
    near.observe(stage);

    return () => {
      cancelled = true;
      near.disconnect();
      resize?.disconnect();
      trigger?.kill();
      scene?.dispose();
    };
  }, []);

  return (
    <div className="intro-ribbon-layer" aria-hidden="true">
      <canvas ref={canvasRef} className="intro-ribbon-canvas" />
    </div>
  );
}
