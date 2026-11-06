import Ribbon from "@/components/intro/Ribbon";
import { capabilities } from "@/config/site";

type Token = { text: string; tone?: "web" | "app" | "ai" | "growth" };

const STATEMENT: Token[] = [
  {
    text: "Viximate is a technology studio for ambitious businesses. We design and engineer",
  },
  { text: "web platforms,", tone: "web" },
  { text: "mobile apps,", tone: "app" },
  { text: "intelligent automation", tone: "ai" },
  { text: "and" },
  { text: "growth engines,", tone: "growth" },
  {
    text: "then wire them together so every part of your digital presence makes the others stronger.",
  },
];

const TITLE = ["Every part,", "pulling the same way."];

const BELT_TONES = ["web", "app", "ai", "growth"] as const;

const PILLARS = [
  {
    title: "Technology first",
    text: "Engineering is our foundation. We choose stacks for performance and longevity, not trends.",
  },
  {
    title: "Creative by nature",
    text: "Considered design and storytelling that give your product a voice worth remembering.",
  },
  {
    title: "Growth as the outcome",
    text: "Everything we ship is measured against one question: does it move your business forward?",
  },
];

export default function Intro() {
  return (
    <section id="about" aria-labelledby="intro-title" className="intro">
      <div className="shell">
        <div className="intro-stage">
          <Ribbon />
          <h2 id="intro-title" className="h2 intro-title" data-reveal="split">
            <span className="sr-only">{TITLE.join(" ")}</span>
            <span aria-hidden="true">
              {TITLE.map((line) => (
                <span key={line} className="split-line intro-title-line">
                  <span className="split-word">{line}</span>
                </span>
              ))}
            </span>
          </h2>
          <div className="intro-ribbon" />
          <p className="statement intro-statement" data-reveal="scrub">
            {STATEMENT.flatMap((token, ti) =>
              token.text.split(" ").map((word, wi) => (
                <span
                  // biome-ignore lint/suspicious/noArrayIndexKey: static copy, order never changes
                  key={`${ti}-${wi}`}
                  className="scrub-word"
                  data-tone={token.tone}
                >
                  {word}{" "}
                </span>
              )),
            )}
          </p>
        </div>

        <ul className="intro-pillars">
          {PILLARS.map((pillar, i) => (
            <li
              key={pillar.title}
              className="intro-pillar"
              data-reveal="up"
              data-reveal-delay={i * 0.08}
            >
              <h3 className="h3">{pillar.title}</h3>
              <p className="body text-muted">{pillar.text}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="intro-belt" aria-hidden="true">
        <div className="intro-belt-track" data-reveal="belt">
          {[0, 1].map((copy) => (
            <div key={copy} className="intro-belt-set">
              {capabilities.map((cap, i) => (
                <span
                  key={`${copy}-${cap}`}
                  className="intro-belt-item"
                  data-tone={BELT_TONES[i % BELT_TONES.length]}
                >
                  {cap}
                  <svg viewBox="0 0 10 10" aria-hidden="true">
                    <path d="M5 0 L6.2 3.8 L10 5 L6.2 6.2 L5 10 L3.8 6.2 L0 5 L3.8 3.8 Z" />
                  </svg>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
