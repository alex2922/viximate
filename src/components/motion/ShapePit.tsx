"use client";

import { usePit } from "@/components/motion/pit";

export type PitItem = {
  /** Text on a pill. Left out, the piece is a plain block. */
  label?: string;
  tone: "web" | "app" | "ai" | "growth";
  round?: boolean;
};

/**
 * A small pile of the footer's shapes, with the footer's physics. Without
 * motion it is a neat row of the same pieces standing on the line.
 */
export default function ShapePit({ items }: { items: PitItem[] }) {
  const stageRef = usePit();
  return (
    <div
      ref={stageRef}
      className="shape-pit"
      aria-hidden="true"
      data-cursor="label"
      data-cursor-label="Throw"
    >
      {items.map(({ label, tone, round }, i) => (
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: a fixed set of pieces
          key={i}
          className={label ? "pit-body pit-pill" : "pit-body pit-block"}
          data-discipline={tone}
          data-shape={round ? "round" : "square"}
        >
          {label}
        </span>
      ))}
    </div>
  );
}
