import type { Metadata } from "next";
import Reveals from "@/components/motion/Reveals";
import ShapePit, { type PitItem } from "@/components/motion/ShapePit";
import PageHead from "@/components/pages/PageHead";
import Process from "@/components/sections/Process";
import Why from "@/components/sections/Why";
import SplitText from "@/components/ui/SplitText";

export const metadata: Metadata = {
  title: "About",
  description:
    "Viximate is a technology studio that designs and engineers websites, apps, automation and growth as one connected system.",
};

const STORY = [
  "Most of the businesses we meet already have a website, maybe an app, a few tools and someone running their social. What they lack is a reason for those parts to talk to each other.",
  "So the website collects leads that sit in an inbox. The app keeps its own accounts. The campaigns report numbers nobody can tie to a sale. Every vendor did their part well, and the whole still leaks.",
  "Viximate exists to build the whole. Engineering, design, automation and growth sit in one team, plan from one map and answer to one goal: does this move your business forward?",
];

const PARTS: PitItem[] = [
  { label: "Website", tone: "web" },
  { label: "App", tone: "app" },
  { label: "Automation", tone: "ai" },
  { label: "Campaigns", tone: "growth" },
  { tone: "ai", round: true },
  { tone: "web" },
  { tone: "app", round: true },
];

export default function AboutPage() {
  return (
    <main id="main" tabIndex={-1}>
      <PageHead
        title={["One studio,", "built around the whole."]}
        lead="We design and engineer websites, apps, automation and growth for ambitious businesses, then wire them together."
        caption="Two pieces, one shape. The mark is the idea."
      />

      <section aria-labelledby="story-title" className="section about-story">
        <div className="shell about-story-grid">
          <div className="about-story-side">
            <SplitText
              id="story-title"
              lines={["Why one team", "for all four."]}
              className="h2 h2-cascade"
              fill
            />
            <ShapePit items={PARTS} />
          </div>
          <div className="about-story-copy">
            {STORY.map((p, i) => (
              <p
                key={p}
                className={i === 0 ? "lead" : "lead text-muted"}
                data-reveal="up"
              >
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>

      <Process />
      <Why />

      <Reveals />
    </main>
  );
}
