"use client";

import { useRef } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import { processSteps } from "@/config/site";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

/**
 * Our approach — a sticky counter and a progress rail that fills as each
 * step crosses the centre of the viewport.
 */
export default function Process({ index }: { index: string }) {
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
              counterRef.current.textContent = processSteps[i].index;
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
          index={index}
          eyebrow="Our approach"
          id="approach-title"
          title={["From signal", "to system."]}
          description="A clear, collaborative process that de-risks every build — and keeps improving it after launch."
        />

        <div className="mt-16 grid gap-10 md:mt-28 md:grid-cols-12 md:gap-6">
          <div className="hidden md:col-span-4 md:block">
            <div className="sticky top-[calc(var(--cs-nav-h)+3rem)]">
              <p className="caption text-muted">Step</p>
              <p
                className="h1 wide text-cs-accent leading-none tabular-nums"
                aria-hidden="true"
              >
                <span ref={counterRef}>01</span>
              </p>
              <p className="caption text-muted mt-4">
                of {String(processSteps.length).padStart(2, "0")}
              </p>
            </div>
          </div>

          <ol className="process-steps relative md:col-span-8">
            <span className="process-rail" aria-hidden="true">
              <span className="process-rail-fill" />
            </span>
            {processSteps.map((step, i) => (
              <li
                key={step.index}
                className="process-step"
                data-active={i === 0 ? "true" : "false"}
              >
                <span className="process-node" aria-hidden="true" />
                <div className="flex items-baseline gap-5">
                  <span className="caption text-cs-accent">{step.index}</span>
                  <h3 className="h3">{step.title}</h3>
                </div>
                <p className="lead text-muted mt-6 max-w-[34ch]">{step.text}</p>
                <ul className="mt-8 flex flex-wrap gap-2">
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
    </section>
  );
}
