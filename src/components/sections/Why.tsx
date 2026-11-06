"use client";

import { Check } from "lucide-react";
import { useRef } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import { reasons } from "@/config/site";
import { gsap, useGSAP } from "@/lib/gsap";

const TONES = ["web", "app", "ai", "growth"] as const;

const COMMITMENTS = [
  "Four disciplines, one team",
  "Senior-led from day one",
  "You own everything we build",
];

/**
 * Why Viximate: a raised dark band lit from one corner, opened by a
 * clip-path reveal as it scrolls in.
 */
export default function Why() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".why-surface",
          { clipPath: "inset(4% 3% 0% 3% round 1.5rem)" },
          {
            clipPath: "inset(0% 0% 0% 0% round 0rem)",
            ease: "none",
            scrollTrigger: {
              trigger: rootRef.current,
              start: "top bottom",
              end: "top 20%",
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
    <section ref={rootRef} id="why" aria-labelledby="why-title" className="why">
      <div className="why-surface">
        <div className="shell why-inner">
          <SectionHeader
            id="why-title"
            title={["Built different,", "on purpose."]}
            description="We sit where engineering, design and growth meet, so you get one partner that sees the whole picture."
          />

          <ul className="why-grid">
            {reasons.map((reason, i) => (
              <li
                key={reason.title}
                className="why-cell"
                data-reveal="up"
                data-reveal-delay={(i % 3) * 0.06}
              >
                <span
                  className="shape"
                  data-discipline={TONES[i % 4]}
                  data-shape={i % 2 ? "round" : "square"}
                  aria-hidden="true"
                />
                <h3 className="h3">{reason.title}</h3>
                <p className="body text-muted">{reason.text}</p>
              </li>
            ))}
          </ul>

          <ul className="why-commits">
            {COMMITMENTS.map((c) => (
              <li key={c} className="why-commit" data-reveal="up">
                <Check size={16} strokeWidth={2} aria-hidden="true" />
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
