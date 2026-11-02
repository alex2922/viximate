import { capabilities } from "@/config/site";

type Token = { text: string; tone?: "accent" | "accent-2" };

const STATEMENT: Token[] = [
  {
    text: "Viximate is a technology studio for ambitious businesses. We design and engineer",
  },
  { text: "web platforms,", tone: "accent" },
  { text: "mobile apps,", tone: "accent-2" },
  { text: "intelligent automation", tone: "accent" },
  { text: "and" },
  { text: "growth engines", tone: "accent-2" },
  {
    text: "— then wire them together, so every part of your digital presence makes the others stronger.",
  },
];

const PILLARS = [
  {
    index: "A",
    title: "Technology first",
    text: "Engineering is our foundation. We choose stacks for performance and longevity, not trends.",
  },
  {
    index: "B",
    title: "Creative by nature",
    text: "Considered design and storytelling that give your product a voice worth remembering.",
  },
  {
    index: "C",
    title: "Growth as the outcome",
    text: "Everything we ship is measured against one question: does it move your business forward?",
  },
];

export default function Intro({ index }: { index: string }) {
  return (
    <section
      id="about"
      aria-labelledby="intro-title"
      className="section overflow-hidden pb-0 md:pb-0"
    >
      <div className="shell">
        <div className="grid gap-8 md:grid-cols-12 md:gap-6">
          <div className="md:col-span-3">
            <p className="eyebrow" data-reveal="up">
              <span>({index}) About</span>
            </p>
          </div>
          <div className="md:col-span-9">
            <h2 id="intro-title" className="sr-only">
              About Viximate
            </h2>
            <p
              className="h3 font-medium tracking-[-0.03em] leading-[1.08]"
              data-reveal="scrub"
            >
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
        </div>

        <div className="mt-20 grid border-t hairline md:mt-32 md:grid-cols-3">
          {PILLARS.map((pillar, i) => (
            <div
              key={pillar.title}
              className={`flex flex-col gap-4 border-b hairline py-8 md:border-b-0 md:py-10 ${i > 0 ? "md:border-l md:pl-8" : "md:pr-8"}`}
              data-reveal="up"
              data-reveal-delay={i * 0.1}
            >
              <span className="caption text-cs-accent">{pillar.index}</span>
              <h3 className="lead font-semibold">{pillar.title}</h3>
              <p className="body text-muted max-w-[34ch]">{pillar.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="intro-belt mt-24 md:mt-36" aria-hidden="true">
        <div className="intro-belt-track on-accent">
          <div
            className="marquee"
            style={{ ["--marquee-duration" as string]: "48s" }}
          >
            {[0, 1].map((copy) => (
              <div key={copy} className="flex shrink-0 items-center">
                {capabilities.map((cap) => (
                  <span
                    key={`${copy}-${cap}`}
                    className="flex items-center gap-8 px-8 py-5"
                  >
                    <span className="h3">{cap}</span>
                    <svg
                      viewBox="0 0 20 20"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <circle cx="10" cy="10" r="5" fill="currentColor" />
                    </svg>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
