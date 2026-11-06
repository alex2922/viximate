"use client";

import { useRef } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import { processSteps } from "@/config/site";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

/**
 * Our approach: a sticky counter, rolling like an odometer, and a progress rail that fills as each
 * step crosses the centre of the viewport.
 */
export default function Process() {
  const rootRef = useRef<HTMLElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const steps = gsap.utils.toArray<HTMLElement>(".process-step", root);
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".process-rail-fill",
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: ".process-steps",
              start: "top 55%",
              end: "bottom 55%",
              scrub: true,
            },
          },
        );
      });

      const triggers = steps.map((step, i) =>
        ScrollTrigger.create({
          trigger: step,
          start: "top 60%",
          end: "bottom 60%",
          onToggle: (self) => {
            step.dataset.active = String(self.isActive);
            if (self.isActive && counterRef.current) {
              // Each digit column rolls to its new figure.
              const digits = processSteps[i].index.padStart(2, "0");
              counterRef.current
                .querySelectorAll<HTMLElement>(".odo-col")
                .forEach((col, d) => {
                  col.style.transform = `translateY(${-Number(digits[d]) * 10}%)`;
                });
            }
          },
        }),
      );

      return () => {
        mm.revert();
        for (const t of triggers) t.kill();
      };
    },
    { scope: rootRef },
  );

  return (
    <section
      ref={rootRef}
      id="approach"
      aria-labelledby="approach-title"
      className="section"
    >
      <div className="shell">
        <SectionHeader
          id="approach-title"
          title={["From signal", "to system."]}
          description="A clear, collaborative process that de-risks every build and keeps improving it after launch."
        />

        <div className="process-layout">
          <div className="hidden md:block">
            <div className="process-counter" aria-hidden="true">
              <span ref={counterRef} className="figure process-counter-num">
                {[0, 1].map((d) => (
                  <span key={d} className="odo">
                    <span
                      className="odo-col"
                      style={
                        d === 1 ? { transform: "translateY(-10%)" } : undefined
                      }
                    >
                      {DIGITS.map((digit) => (
                        <span key={digit}>{digit}</span>
                      ))}
                    </span>
                  </span>
                ))}
              </span>
              <span className="caption text-muted">
                Step of {String(processSteps.length).padStart(2, "0")}
              </span>
            </div>
          </div>

          <div className="process-steps">
            <span className="process-rail" aria-hidden="true">
              <span className="process-rail-fill" />
            </span>
            <ol>
              {processSteps.map((step, i) => (
                <li
                  key={step.index}
                  className="process-step"
                  data-active={i === 0 ? "true" : "false"}
                >
                  <span className="process-node" aria-hidden="true" />
                  <div className="process-step-head">
                    <h3 className="h3">{step.title}</h3>
                  </div>
                  <p className="body text-muted process-step-text">
                    {step.text}
                  </p>
                  <ul className="process-outputs">
                    {step.outputs.map((output) => (
                      <li key={output} className="chip">
                        {output}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
