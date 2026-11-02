"use client";

import { useRef } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import { reasons } from "@/config/site";
import { gsap, useGSAP } from "@/lib/gsap";

const COMMITMENTS = [
  "Four disciplines, one team",
  "Senior-led from day one",
  "You own everything we build",
];

/** Why Viximate — the one inverted (acid green) chapter, opened with a clip-path reveal. */
export default function Why({ index }: { index: string }) {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const radius =
          getComputedStyle(document.documentElement)
            .getPropertyValue("--cs-radius")
            .trim() || "0.5rem";
        const unit = radius.replace(/[\d.]/g, "") || "px";
        gsap.fromTo(
          ".why-surface",
          { clipPath: `inset(6% 5% 0% 5% round ${radius})` },
          {
            clipPath: `inset(0% 0% 0% 0% round 0${unit})`,
            ease: "none",
            scrollTrigger: {
              trigger: rootRef.current,
              start: "top bottom",
              end: "top 15%",
              scrub: true,
            },
          },
        );
      });
      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <section
      ref={rootRef}
      id="why"
      aria-labelledby="why-title"
      className="relative"
    >
      <div className="why-surface on-accent section">
        <div className="shell">
          <SectionHeader
            index={index}
            eyebrow="Why Viximate"
            id="why-title"
            title={["Built different,", "on purpose."]}
            description="We sit where engineering, design and growth meet — so you get one partner that understands the whole picture."
          />

          <ul className="mt-16 grid border-t hairline sm:grid-cols-2 md:mt-24 lg:grid-cols-3">
            {reasons.map((reason, i) => (
              <li
                key={reason.title}
                className="why-cell"
                data-reveal="up"
                data-reveal-delay={(i % 3) * 0.08}
              >
                <span className="caption">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="lead font-semibold mt-10">{reason.title}</h3>
                <p className="body text-muted mt-3 max-w-[36ch]">
                  {reason.text}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-16 flex flex-col gap-3 md:mt-24 md:flex-row md:flex-wrap md:gap-4">
            {COMMITMENTS.map((c) => (
              <span key={c} className="why-commit" data-reveal="up">
                <svg
                  viewBox="0 0 16 16"
                  className="h-4 w-4 shrink-0"
                  aria-hidden="true"
                >
                  <path
                    d="M3 8.5 L6.5 12 L13 4.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
