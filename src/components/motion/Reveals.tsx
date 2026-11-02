"use client";

import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

/**
 * Attaches scroll reveals to server-rendered markup:
 *   data-reveal="up"      fade + rise
 *   data-reveal="split"   masked word/line rise (expects .split-word children)
 *   data-reveal="line"    hairline draws in
 *   data-reveal="scrub"   words brighten as you read (expects .scrub-word children)
 * Optional data-reveal-delay="0.2".
 */
export default function Reveals() {
  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const items = gsap.utils.toArray<HTMLElement>("[data-reveal]");

      for (const el of items) {
        const type = el.dataset.reveal;
        const delay = Number(el.dataset.revealDelay ?? 0);
        const scrollTrigger = { trigger: el, start: "top 88%", once: true };

        if (type === "up") {
          gsap.from(el, {
            y: 48,
            autoAlpha: 0,
            duration: 1.2,
            ease: "expo.out",
            delay,
            scrollTrigger,
          });
        } else if (type === "split") {
          gsap.from(el.querySelectorAll(".split-word"), {
            yPercent: 110,
            rotate: 4,
            duration: 1.25,
            ease: "expo.out",
            stagger: 0.045,
            delay,
            scrollTrigger,
          });
        } else if (type === "line") {
          gsap.from(el, {
            scaleX: 0,
            transformOrigin: "left center",
            duration: 1.4,
            ease: "expo.inOut",
            delay,
            scrollTrigger,
          });
        } else if (type === "scrub") {
          const words = el.querySelectorAll<HTMLElement>(".scrub-word");
          const css = getComputedStyle(document.documentElement);
          const resolve = (tone?: string) =>
            css
              .getPropertyValue(tone ? `--cs-${tone}` : "--cs-foreground")
              .trim();
          gsap.to(words, {
            color: (_i: number, word: HTMLElement) =>
              resolve(word.dataset.tone),
            stagger: 0.1,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top 80%",
              end: "bottom 45%",
              scrub: true,
            },
          });
        }
      }
    });

    return () => mm.revert();
  });

  // Re-measure after late layout shifts (images, fonts, pinned sections).
  useGSAP(() => {
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 1200);
    return () => window.clearTimeout(id);
  });

  return null;
}
