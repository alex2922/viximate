import type { Metadata } from "next";
import Reveals from "@/components/motion/Reveals";
import Contact from "@/components/sections/Contact";
import SectionHeader from "@/components/ui/SectionHeader";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Tell Viximate about your project: the website, app, automation or growth work you need, and where you want it to go.",
};

const NEXT = [
  {
    title: "We read your brief",
    text: "Someone senior reads it properly and comes back with questions, not a template.",
  },
  {
    title: "A short call",
    text: "We talk through the goal, what exists today and what success should look like.",
  },
  {
    title: "A written proposal",
    text: "Scope, timeline and cost in plain language, with the first step we would take.",
  },
];

export default function ContactPage() {
  return (
    <main id="main" tabIndex={-1}>
      <Contact heading="h1" />

      <section aria-labelledby="next-title" className="section contact-next">
        <div className="shell">
          <SectionHeader
            id="next-title"
            title={["What happens", "after you write."]}
          />
          <ol className="step-strip step-strip--three">
            {NEXT.map((step, i) => (
              <li key={step.title} className="step-strip-item" data-reveal="up">
                <span
                  className="shape"
                  data-discipline={["web", "app", "growth"][i]}
                  data-shape={i % 2 ? "round" : "square"}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="h3">{step.title}</h3>
                <p className="body text-muted">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <Reveals />
    </main>
  );
}
