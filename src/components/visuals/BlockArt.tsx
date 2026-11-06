import { FIGURES, type FigureId } from "@/config/figures";

/**
 * A figure as flat blocks. In a tile they lie scattered until it is switched
 * on, then snap into the shape: the hero's story, in small.
 */
export default function BlockArt({ id }: { id: FigureId }) {
  return (
    <svg
      viewBox="0 0 240 160"
      className="block-art"
      aria-hidden="true"
      fill="currentColor"
    >
      {FIGURES[id].map(([x, y, width, height, rx, ink], i) => (
        <rect
          // biome-ignore lint/suspicious/noArrayIndexKey: a fixed drawing
          key={i}
          x={x}
          y={y}
          width={width}
          height={height}
          rx={rx}
          data-ink={ink}
          style={
            {
              "--i": i,
              "--dx": `${((i * 73 + 31) % 150) - 75}px`,
              "--dy": `${((i * 47 + 17) % 110) - 55}px`,
              "--dr": `${((i * 59 + 11) % 120) - 60}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </svg>
  );
}
