type LogoProps = { className?: string; showWordmark?: boolean };

/** Viximate mark: two nodes converging into one — a "V" drawn as a network. */
export default function Logo({ className, showWordmark = true }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true">
        <path
          d="M6 7 L16 25 L26 7"
          fill="none"
          stroke="var(--cs-foreground)"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <circle cx="6" cy="7" r="3.6" fill="var(--cs-foreground)" />
        <circle cx="26" cy="7" r="3.6" fill="var(--cs-accent-2)" />
        <circle cx="16" cy="25" r="4.4" fill="var(--cs-accent)" />
      </svg>
      {showWordmark ? (
        <span className="font-heading text-[1.15rem] font-bold tracking-[-0.03em] wide">
          viximate
        </span>
      ) : null}
    </span>
  );
}
