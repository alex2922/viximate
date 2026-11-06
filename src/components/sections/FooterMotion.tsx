"use client";

import { usePathname } from "next/navigation";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * The footer's motion, tied to the scroll: it rises from under the page and
 * the columns step up one after another. The pit below runs its own physics.
 * Rebuilt per page, since the footer's position changes with the page.
 */
export default function FooterMotion() {
  const pathname = usePathname();

  useGSAP(
    () => {
      const footer = document.querySelector<HTMLElement>(".footer");
      if (!footer) return;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const inner = footer.querySelector(".footer-inner");

        // Rises from under the page: the content trails the scroll.
        gsap.fromTo(
          inner,
          { yPercent: -14 },
          {
            yPercent: 0,
            ease: "none",
            scrollTrigger: {
              trigger: footer,
              start: "top bottom",
              end: "bottom bottom",
              scrub: true,
            },
          },
        );

        // Columns step up once.
        gsap.from(".footer-cols > div, .footer-brand > *", {
          y: 28,
          autoAlpha: 0,
          duration: 0.9,
          ease: "expo.out",
          stagger: 0.06,
          scrollTrigger: {
            trigger: ".footer-top",
            start: "top 90%",
            once: true,
          },
        });
      });

      return () => mm.revert();
    },
    { dependencies: [pathname], revertOnUpdate: true },
  );

  return null;
}
