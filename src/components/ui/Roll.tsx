import type { CSSProperties } from "react";

type RollProps = {
  children: string;
  /** Roll letter by letter, staggered, instead of the label as one piece. */
  letters?: boolean;
  className?: string;
};

/**
 * A label that rolls up to a fresh copy of itself when its link or button
 * is hovered or focused. Screen readers get the plain label once.
 */
export default function Roll({
  children,
  letters = false,
  className,
}: RollProps) {
  const parts = letters ? Array.from(children) : [children];
  return (
    <span className={className ? `roll ${className}` : "roll"}>
      <span className="sr-only">{children}</span>
      <span className="roll-face" aria-hidden="true">
        {parts.map((part, i) => {
          const face = part === " " ? " " : part;
          return (
            <span
              // biome-ignore lint/suspicious/noArrayIndexKey: letters repeat; their order never changes
              key={i}
              className="roll-char"
              style={{ "--i": i } as CSSProperties}
            >
              <span>{face}</span>
              <span>{face}</span>
            </span>
          );
        })}
      </span>
    </span>
  );
}
