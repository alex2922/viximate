import type { ServiceId } from "@/config/site";

/** Compact line-art glyph for each service (used in the services index). */
export default function ServiceGlyph({ id }: { id: ServiceId }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  return (
    <svg aria-hidden="true" viewBox="0 0 120 72" className="h-full w-full">
      {id === "web" ? (
        <g {...common}>
          <rect x="6" y="6" width="108" height="60" rx="6" />
          <path d="M6 18 H114" />
          <circle cx="14" cy="12" r="1.5" />
          <circle cx="20" cy="12" r="1.5" />
          <path d="M16 30 H62 M16 38 H52 M16 50 H34" />
          <rect x="72" y="26" width="32" height="30" rx="3" />
        </g>
      ) : null}
      {id === "app" ? (
        <g {...common}>
          <rect x="22" y="4" width="34" height="64" rx="7" />
          <rect
            x="64"
            y="12"
            width="34"
            height="56"
            rx="7"
            transform="rotate(8 81 40)"
          />
          <path d="M33 10 H45 M30 50 H48 M30 56 H42" />
          <circle cx="39" cy="30" r="8" />
        </g>
      ) : null}
      {id === "ai" ? (
        <g {...common}>
          <path d="M14 14 C40 14 40 36 60 36 M14 36 H60 M14 58 C40 58 40 36 60 36 M60 36 C80 36 80 20 106 20 M60 36 C80 36 80 52 106 52" />
          <circle cx="14" cy="14" r="4" />
          <circle cx="14" cy="36" r="4" />
          <circle cx="14" cy="58" r="4" />
          <circle cx="60" cy="36" r="9" />
          <circle cx="106" cy="20" r="4" />
          <circle cx="106" cy="52" r="4" />
        </g>
      ) : null}
      {id === "growth" ? (
        <g {...common}>
          <path d="M8 64 H112" />
          <rect x="14" y="44" width="14" height="20" rx="2" />
          <rect x="38" y="36" width="14" height="28" rx="2" />
          <rect x="62" y="26" width="14" height="38" rx="2" />
          <rect x="86" y="12" width="14" height="52" rx="2" />
          <path d="M12 36 L44 24 L68 16 L104 4" />
        </g>
      ) : null}
    </svg>
  );
}
