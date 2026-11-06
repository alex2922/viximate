"use client";

import { usePit } from "@/components/motion/pit";
import { Mark } from "@/components/ui/Logo";
import { services } from "@/config/site";

const WORD = Array.from("viximate");

/** The loose blocks, in the hero's colours: [tone, shape]. */
const BLOCKS = [
  ["web", "square"],
  ["ai", "round"],
  ["growth", "square"],
  ["app", "round"],
  ["ai", "square"],
] as const;

/**
 * The last thing on every page, after React Bits' Falling Text. The wordmark
 * drops in letter by letter, lands in order, and the disciplines and loose
 * blocks tumble in on top. Everything can be pushed, grabbed and thrown. Left
 * alone, it all sorts itself back into order, the same story as the hero, and
 * the next touch brings it down again.
 * Without motion it is simply the wordmark, set in place by the stylesheet.
 */
export default function FooterPit() {
  const stageRef = usePit();

  return (
    <>
      <div className="pit-bar" aria-hidden="true">
        <div className="shell pit-bar-inner">
          <span className="caption">Go on, throw something.</span>
          <span className="caption text-muted">It tidies itself up.</span>
        </div>
      </div>
      <div
        ref={stageRef}
        className="pit"
        aria-hidden="true"
        data-cursor="label"
        data-cursor-label="Throw"
      >
        <div className="shell pit-loose">
          {services.map((service) => (
            <span
              key={service.id}
              className="pit-body pit-pill"
              data-discipline={service.id}
            >
              {service.title}
            </span>
          ))}
          {BLOCKS.map(([tone, shape], i) => (
            <span
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed decorative blocks
              key={i}
              className="pit-body pit-block"
              data-discipline={tone}
              data-shape={shape}
            />
          ))}
        </div>
        <div className="shell pit-word">
          <span className="pit-body pit-mark" data-word="">
            <Mark />
          </span>
          {WORD.map((char, i) => (
            <span
              // biome-ignore lint/suspicious/noArrayIndexKey: letters repeat; the word never changes
              key={i}
              className="pit-body pit-letter"
              data-word=""
            >
              {char}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
