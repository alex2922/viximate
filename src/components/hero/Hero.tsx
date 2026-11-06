"use client";

import { ArrowDown, ArrowUpRight } from "lucide-react";
import { useRef } from "react";
import Magnetic from "@/components/motion/Magnetic";
import Roll from "@/components/ui/Roll";
import { site } from "@/config/site";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { loadedSignal, useSignal } from "@/lib/signal";
import HeroScene from "./HeroScene";
import type { PileScene } from "./pileScene";

const LINES = ["You imagine.", "We create."];

export default function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<PileScene | null>(null);
  const loaded = useSignal(loadedSignal);

  const attachScene = (scene: PileScene | null) => {
    sceneRef.current = scene;
    if (scene && loadedSignal.get()) scene.drop();
  };

  // Hold the intro state while the loader is up (scripted only, so the
  // page reads in full with scripting off).
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (loadedSignal.get()) return;
        gsap.set(".hero-word", { yPercent: 110 });
        gsap.set(".hero-fade", { autoAlpha: 0, y: 12 });
      });
    },
    { scope: rootRef },
  );

  // Once the loader lifts: the blocks fall, the head rises.
  useGSAP(
    () => {
      if (!loaded) return;
      sceneRef.current?.drop();
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap
          .timeline({ defaults: { ease: "expo.out" } })
          .to(".hero-word", { yPercent: 0, duration: 1.1, stagger: 0.08 }, 0.35)
          .to(
            ".hero-fade",
            { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.06 },
            0.7,
          );
      });
    },
    { scope: rootRef, dependencies: [loaded] },
  );

  // The hero holds while you scroll. The blocks become the mark, the colour
  // drains from the room, and "We create." fills in as the last block lands.
  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        ScrollTrigger.create({
          trigger: root,
          start: "top top",
          end: "+=130%",
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          onUpdate: (self) => {
            sceneRef.current?.setAssembly(self.progress);
            root.style.setProperty("--hero-p", self.progress.toFixed(3));
          },
        });
      });
      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <section
      ref={rootRef}
      id="top"
      aria-labelledby="hero-title"
      className="hero"
    >
      <div className="hero-canvas">
        <HeroScene onScene={attachScene} />
      </div>

      <div className="hero-head shell">
        <h1 id="hero-title" className="h1 hero-title">
          <span className="sr-only">{LINES.join(" ")}</span>
          <span aria-hidden="true">
            {LINES.map((line) => (
              <span key={line} className="split-line">
                <span className="hero-word split-word">{line}</span>
              </span>
            ))}
          </span>
        </h1>
        <div className="hero-side">
          <p className="lead text-muted hero-fade hero-lede">
            Websites, apps, AI automation and growth, built to work as one.
          </p>
          <div className="hero-fade hero-actions">
            <Magnetic>
              <a href={site.cta.href} className="btn btn-primary">
                <Roll>{site.cta.label}</Roll>
                <span className="btn-icon">
                  <ArrowUpRight size={18} strokeWidth={2} aria-hidden="true" />
                </span>
              </a>
            </Magnetic>
            <Magnetic>
              <a href="#services" className="btn">
                <Roll>Explore what we do</Roll>
                <span className="btn-icon btn-icon--down">
                  <ArrowDown size={18} strokeWidth={2} aria-hidden="true" />
                </span>
              </a>
            </Magnetic>
          </div>
        </div>
      </div>
    </section>
  );
}
