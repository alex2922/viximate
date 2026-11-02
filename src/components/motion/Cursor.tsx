"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Custom cursor for fine pointers.
 * Elements opt in with data-cursor="hover" or data-cursor="label" data-cursor-label="View".
 * Links and buttons get the hover state automatically.
 */
export default function Cursor() {
  const rootRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    const update = () => setEnabled(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!enabled || !root || !dot || !ring) return;

    document.documentElement.classList.add("has-cursor");
    const dotX = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3.out" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3.out" });
    const ringX = gsap.quickTo(ring, "x", {
      duration: 0.55,
      ease: "power3.out",
    });
    const ringY = gsap.quickTo(ring, "y", {
      duration: 0.55,
      ease: "power3.out",
    });

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      root.dataset.hidden = "false";
      dotX(event.clientX);
      dotY(event.clientY);
      ringX(event.clientX);
      ringY(event.clientY);
    };

    const onOver = (event: PointerEvent) => {
      const target = event.target as Element | null;
      const labelled = target?.closest<HTMLElement>("[data-cursor='label']");
      if (labelled) {
        root.dataset.state = "label";
        setLabel(labelled.dataset.cursorLabel ?? "View");
        return;
      }
      if (target?.closest("input, textarea, select")) {
        root.dataset.state = "text";
        return;
      }
      if (target?.closest("a, button, label, [data-cursor='hover']")) {
        root.dataset.state = "hover";
        return;
      }
      root.dataset.state = "default";
    };

    const onLeaveWindow = () => {
      root.dataset.hidden = "true";
    };

    // Canvas-driven hovers (e.g. WebGL objects) announce themselves via a custom event.
    const onCustom = (event: Event) => {
      const next = (event as CustomEvent<{ label: string | null }>).detail
        ?.label;
      if (next) {
        root.dataset.state = "label";
        setLabel(next);
      } else {
        root.dataset.state = "default";
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver);
    document.documentElement.addEventListener("pointerleave", onLeaveWindow);
    window.addEventListener("vx:cursor", onCustom);

    return () => {
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.documentElement.removeEventListener(
        "pointerleave",
        onLeaveWindow,
      );
      window.removeEventListener("vx:cursor", onCustom);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={rootRef}
      className="vx-cursor"
      data-state="default"
      data-hidden="true"
      aria-hidden="true"
    >
      <div ref={ringRef} className="vx-cursor-ring">
        <span className="vx-cursor-label">{label}</span>
      </div>
      <div ref={dotRef} className="vx-cursor-dot" />
    </div>
  );
}
