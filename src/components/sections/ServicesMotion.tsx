"use client";

import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

/**
 * Draws the wire through the four tiles with the scroll. Each tile switches on
 * as the wire reaches it, and the end of the wire lights "One system". Nothing
 * is held back until this runs, so without it the tiles simply show finished.
 */
export default function ServicesMotion() {
  useGSAP(() => {
    const list = document.querySelector<HTMLElement>(".svc-tiles");
    if (!list) return;
    const tiles = gsap.utils.toArray<HTMLElement>(".svc-tile", list);
    const end = list.querySelector<HTMLElement>(".svc-wire-end");
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      for (const tile of tiles) tile.dataset.on = "false";
      if (end) end.dataset.on = "false";
      const trigger = ScrollTrigger.create({
        trigger: list,
        start: "top 78%",
        end: () => (window.innerWidth >= 1024 ? "top 22%" : "bottom 72%"),
        scrub: 0.5,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          list.style.setProperty("--wire", self.progress.toFixed(3));
          tiles.forEach((tile, i) => {
            tile.dataset.on = String(
              self.progress >= (i + 0.35) / (tiles.length + 0.35),
            );
          });
          if (end) end.dataset.on = String(self.progress > 0.985);
        },
      });
      return () => {
        trigger.kill();
        for (const tile of tiles) tile.dataset.on = "true";
        if (end) end.dataset.on = "true";
        list.style.removeProperty("--wire");
      };
    });

    return () => mm.revert();
  });

  return null;
}
