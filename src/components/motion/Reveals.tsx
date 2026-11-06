"use client";

import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

/**
 * Attaches scroll reveals to server-rendered markup:
 *   data-reveal="up"      fade + rise
 *   data-reveal="split"   masked word/line rise (expects .split-word children)
 *   data-reveal="line"    hairline draws in
 *   data-reveal="scrub"   words brighten as you read (expects .scrub-word children)
 *   data-reveal="belt"    a row that travels sideways with the scroll
 *   data-assemble         its flat blocks snap together as it arrives
 * Optional data-reveal-delay="0.2".
 */
export default function Reveals() {
  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const items = gsap.utils.toArray<HTMLElement>("[data-reveal]");

      // Cascading heads: each line brightens in turn as the head passes.
      for (const el of gsap.utils.toArray<HTMLElement>("[data-fill]")) {
        gsap.fromTo(
          el.querySelectorAll(".split-line"),
          { opacity: 0.22 },
          {
            opacity: 1,
            ease: "none",
            stagger: 0.5,
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              end: "bottom 50%",
              scrub: true,
            },
          },
        );
      }

      for (const el of gsap.utils.toArray<HTMLElement>("[data-assemble]")) {
        el.dataset.on = "false";
        ScrollTrigger.create({
          trigger: el,
          start: "top 78%",
          once: true,
          onEnter: () => {
            el.dataset.on = "true";
          },
        });
      }

      for (const el of items) {
        const type = el.dataset.reveal;
        const delay = Number(el.dataset.revealDelay ?? 0);
        const scrollTrigger = { trigger: el, start: "top 88%", once: true };

        if (type === "up") {
          gsap.from(el, {
            y: 24,
            autoAlpha: 0,
            duration: 0.8,
            ease: "expo.out",
            delay,
            scrollTrigger,
          });
        } else if (type === "split") {
          gsap.from(el.querySelectorAll(".split-word"), {
            yPercent: 110,
            duration: 0.9,
            ease: "expo.out",
            stagger: 0.04,
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
          // Words brighten as the reader passes them (opacity only).
          gsap.fromTo(
            el.querySelectorAll<HTMLElement>(".scrub-word"),
            { opacity: 0.18 },
            {
              opacity: 1,
              stagger: 0.1,
              ease: "none",
              scrollTrigger: {
                trigger: el,
                start: "top 80%",
                end: "bottom 45%",
                scrub: true,
              },
            },
          );
        } else if (type === "belt") {
          // The capability belt travels with the scroll, never on its own.
          gsap.fromTo(
            el,
            { xPercent: 0 },
            {
              xPercent: -30,
              ease: "none",
              scrollTrigger: {
                trigger: el,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.6,
              },
            },
          );
        }
      }
    });

    return () => {
      mm.revert();
      for (const el of gsap.utils.toArray<HTMLElement>("[data-assemble]")) {
        delete el.dataset.on;
      }
    };
  });

  // Re-measure after late layout shifts (images, fonts, pinned sections).
  useGSAP(() => {
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 1200);
    return () => window.clearTimeout(id);
  });

  return null;
}
