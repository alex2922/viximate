import { MARK_CHEVRON, MARK_TOP, MARK_VIEWBOX } from "@/config/brand";

/** The Viximate mark on its own: one solid colour, set by the text colour. */
export function Mark({ className }: { className?: string }) {
  return (
    <svg
      viewBox={`0 0 ${MARK_VIEWBOX.width} ${MARK_VIEWBOX.height}`}
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d={MARK_TOP} />
      <path d={MARK_CHEVRON} />
    </svg>
  );
}

type LogoProps = { className?: string };

/** Mark plus wordmark, as used in the header. */
export default function Logo({ className }: LogoProps) {
  return (
    <span className={`vx-logo ${className ?? ""}`}>
      <Mark className="vx-logo-mark" />
      <span className="vx-logo-word">viximate</span>
    </span>
  );
}
