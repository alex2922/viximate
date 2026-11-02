import type { Ref } from "react";

type NumCounterProps = {
  digits?: number;
  className?: string;
  ref?: Ref<HTMLSpanElement>;
};

/**
 * Zero-padded counter. The value is written imperatively (via ref textContent)
 * so it can be tweened at 60fps without re-rendering.
 */
const NumCounter = ({ digits = 3, className, ref }: NumCounterProps) => (
  <span ref={ref} className={`tabular-nums ${className ?? ""}`}>
    {"0".repeat(digits)}
  </span>
);

export default NumCounter;
