"use client";

import { ArrowDown, ArrowUpRight } from "lucide-react";
import { useRef, useState } from "react";
import Magnetic from "@/components/motion/Magnetic";
import { services } from "@/config/site";
import { gsap, useGSAP } from "@/lib/gsap";
import { scrollToId } from "@/lib/scroll";
import { loadedSignal, useSignal } from "@/lib/signal";
import type { EcosystemScene } from "./ecosystemScene";
import HeroScene from "./HeroScene";

const LINES = [
  { text: "We engineer", indent: false },
  { text: "digital", indent: true, pill: true },
  { text: "ecosystems.", indent: false, accent: true },
];

function NodePill() {
  return (
    <span className="hero-pill" aria-hidden="true">
      <svg aria-hidden="true" viewBox="0 0 120 48" className="h-full w-auto">
        <path d="M14 24 H54 M66 24 H106" className="hero-pill-line" />
        <circle cx="14" cy="24" r="7" className="hero-pill-node" />
        <circle cx="60" cy="24" r="11" className="hero-pill-core" />
        <circle
          cx="106"
          cy="24"
          r="7"
          className="hero-pill-node hero-pill-node--alt"
        />
        <circle r="4" className="hero-pill-packet">
          <animateMotion
            dur="2.4s"
            repeatCount="indefinite"
            path="M14 24 H106"
          />
        </circle>
      </svg>
    </span>
  );
}

export default function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<EcosystemScene | null>(null);
  const [active, setActive] = useState<number | null>(null);
  const loaded = useSignal(loadedSignal);

  const selectService = (index: number) => {
    scrollToId(`service-${services[index].id}`);
  };

  const onSceneHover = (index: number | null) => {
    setActive(index);
    window.dispatchEvent(
      new CustomEvent("vx:cursor", {
        detail: { label: index === null ? null : "Explore" },
      }),
    );
  };

  const highlight = (index: number | null) => {
    setActive(index);
    sceneRef.current?.highlight(index);
  };

  // Hide intro elements while the loader is up.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (loadedSignal.get()) return;
        gsap.set(".hero-word", { yPercent: 115, rotate: 6 });
        gsap.set(".hero-fade", { autoAlpha: 0, y: 24 });
        gsap.set(".hero-canvas", { autoAlpha: 0, scale: 1.12 });
      });
    },
    { scope: rootRef },
  );

  // Intro once the loader releases the page.
  useGSAP(
    () => {
      if (!loaded) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
        tl.to(".hero-canvas", { autoAlpha: 1, scale: 1, duration: 2.2 }, 0)
          .to(
            ".hero-word",
            { yPercent: 0, rotate: 0, duration: 1.4, stagger: 0.09 },
            0.15,
          )
          .to(
            ".hero-fade",
            { autoAlpha: 1, y: 0, duration: 1.2, stagger: 0.08 },
            0.6,
          );
      });
    },
    { scope: rootRef, dependencies: [loaded] },
  );

  // Scroll-out choreography: dive into the network, lift the copy away.
  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: root,
              start: "top top",
              end: "bottom top",
              scrub: true,
              onUpdate: (self) => sceneRef.current?.setScroll(self.progress),
            },
          })
          .to(
            ".hero-content",
            { yPercent: -18, autoAlpha: 0, ease: "power1.in" },
            0,
          )
          .to(".hero-canvas-inner", { autoAlpha: 0.15, ease: "power2.in" }, 0);
      });
    },
    { scope: rootRef },
  );

  return (
    <section
      ref={rootRef}
      id="top"
      aria-labelledby="hero-title"
      className="relative h-[100svh] min-h-[620px] w-full overflow-hidden"
    >
      <div className="hero-canvas absolute inset-0">
        <div className="hero-canvas-inner absolute inset-0">
          <HeroScene
            onScene={(scene) => {
              sceneRef.current = scene;
            }}
            onHover={onSceneHover}
            onSelect={selectService}
          />
        </div>
      </div>
      <div className="hero-veil pointer-events-none absolute inset-0" />

      <div className="hero-content pointer-events-none relative z-10 shell flex h-full flex-col justify-between pt-[calc(var(--cs-nav-h)+1.25rem)] pb-5 md:pb-8">
        <div className="flex items-start justify-between gap-6">
          <p className="eyebrow hero-fade">Technology-driven digital agency</p>

          <ul
            className="hero-fade pointer-events-auto hidden flex-col items-end gap-1 lg:flex"
            aria-label="Services"
          >
            {services.map((service, i) => (
              <li key={service.id}>
                <button
                  type="button"
                  className="hero-legend"
                  data-active={active === i}
                  data-tone={service.tone}
                  onPointerEnter={() => highlight(i)}
                  onPointerLeave={() => highlight(null)}
                  onFocus={() => highlight(i)}
                  onBlur={() => highlight(null)}
                  onClick={() => selectService(i)}
                >
                  <span className="caption text-muted">{service.index}</span>
                  <span>{service.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h1 id="hero-title" className="h1">
            <span className="sr-only">We engineer digital ecosystems.</span>
            <span aria-hidden="true">
              {LINES.map((line) => (
                <span
                  key={line.text}
                  className={`split-line ${line.indent ? "pl-[4vw] md:pl-[7vw]" : ""}`}
                >
                  <span
                    className={`hero-word split-word ${line.accent ? "text-cs-accent" : ""}`}
                  >
                    {line.text}
                    {line.pill ? <NodePill /> : null}
                  </span>
                </span>
              ))}
            </span>
          </h1>

          <div className="mt-6 grid items-end gap-6 md:mt-10 md:grid-cols-12">
            <p className="lead hero-fade text-muted md:col-span-6 lg:col-span-5">
              A technology-led studio building{" "}
              <span className="text-cs-foreground">websites</span>,{" "}
              <span className="text-cs-foreground">apps</span>,{" "}
              <span className="text-cs-foreground">AI automation</span> and{" "}
              <span className="text-cs-foreground">growth systems</span> that
              work as one.
            </p>
            <div className="hero-fade pointer-events-auto flex flex-wrap gap-3 md:col-span-6 md:justify-end lg:col-span-7">
              <Magnetic>
                <a href="#contact" className="btn btn-primary">
                  Start a Project
                  <span className="btn-icon">
                    <ArrowUpRight
                      size={18}
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                  </span>
                </a>
              </Magnetic>
              <Magnetic>
                <a href="#services" className="btn btn-ghost">
                  Explore What We Do
                  <span className="btn-icon">
                    <ArrowDown size={18} strokeWidth={2} aria-hidden="true" />
                  </span>
                </a>
              </Magnetic>
            </div>
          </div>

          <div className="hero-fade mt-8 flex items-center justify-between border-t hairline pt-4 md:mt-12">
            <span className="caption text-muted flex items-center gap-3">
              <span className="hero-scroll-cue" aria-hidden="true" />
              Scroll to explore
            </span>
            <span className="caption text-muted hidden md:inline">
              {active === null
                ? "Hover the network · click a panel"
                : `${services[active].index} — ${services[active].title}`}
            </span>
            <span className="caption text-muted md:hidden">Tap a panel</span>
          </div>
        </div>
      </div>
    </section>
  );
}
