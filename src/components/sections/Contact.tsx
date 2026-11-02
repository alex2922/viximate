"use client";

import { ArrowUpRight, Check } from "lucide-react";
import { type FormEvent, useState } from "react";
import Magnetic from "@/components/motion/Magnetic";
import SplitText from "@/components/ui/SplitText";
import { services, site } from "@/config/site";

const BUDGETS = ["< $5k", "$5k – $15k", "$15k – $50k", "$50k+", "Not sure yet"];

type Status = "idle" | "sent";

/**
 * Project inquiry. There is no backend yet, so submitting composes a
 * pre-filled email in the visitor's mail app — honest and fully functional.
 */
export default function Contact({ index }: { index: string }) {
  const [status, setStatus] = useState<Status>("idle");

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const company = String(data.get("company") ?? "").trim();
    const picked = data.getAll("services").map(String);
    const budget = String(data.get("budget") ?? "");
    const message = String(data.get("message") ?? "").trim();

    const lines = [`Name: ${name}`, `Email: ${email}`];
    if (company) lines.push(`Company: ${company}`);
    if (picked.length) lines.push(`Interested in: ${picked.join(", ")}`);
    if (budget) lines.push(`Budget: ${budget}`);
    if (message) lines.push("", message);

    const subject = `Project inquiry — ${name}${company ? ` (${company})` : ""}`;
    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
    setStatus("sent");
  };

  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="section contact-section"
    >
      <div className="shell">
        <div className="grid gap-16 lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-span-6">
            <p className="eyebrow" data-reveal="up">
              <span>({index}) Start a project</span>
            </p>
            <SplitText
              id="contact-title"
              as="h2"
              lines={["Let's build", "what's next."]}
              className="h1 mt-8"
              decorate={(word) =>
                word === "next." ? (
                  <span className="text-cs-accent-2">{word}</span>
                ) : (
                  word
                )
              }
            />
            <p className="lead text-muted mt-8 max-w-[32ch]" data-reveal="up">
              Tell us where you are and where you want to be. We'll come back
              with ideas — not a sales script.
            </p>
            <a
              href={`mailto:${site.email}`}
              className="contact-mail h3 link-line mt-12 inline-flex items-center gap-4"
              data-reveal="up"
            >
              {site.email}
              <ArrowUpRight
                className="h-[0.8em] w-[0.8em]"
                aria-hidden="true"
              />
            </a>
          </div>

          <div className="lg:col-span-6">
            {status === "sent" ? (
              // biome-ignore lint/a11y/useSemanticElements: live confirmation panel with rich content
              <div className="contact-done r" role="status">
                <span className="contact-done-icon">
                  <Check size={22} aria-hidden="true" />
                </span>
                <p className="h3 mt-8">Almost there.</p>
                <p className="lead text-muted mt-4 max-w-[34ch]">
                  Your email app should have opened with your project details —
                  just hit send. If nothing opened, write to us directly at{" "}
                  <a
                    href={`mailto:${site.email}`}
                    className="text-cs-foreground link-line"
                  >
                    {site.email}
                  </a>
                  .
                </p>
                <button
                  type="button"
                  className="btn btn-ghost mt-10"
                  onClick={() => setStatus("idle")}
                >
                  Edit inquiry
                  <span className="btn-icon">
                    <ArrowUpRight size={18} aria-hidden="true" />
                  </span>
                </button>
              </div>
            ) : (
              <form
                className="flex flex-col gap-10"
                onSubmit={onSubmit}
                noValidate
                data-reveal="up"
              >
                <div className="grid gap-8 sm:grid-cols-2">
                  <label className="flex flex-col">
                    <span className="caption text-muted">Your name *</span>
                    <input
                      className="field"
                      name="name"
                      autoComplete="name"
                      required
                      placeholder="Jane Doe"
                    />
                  </label>
                  <label className="flex flex-col">
                    <span className="caption text-muted">Email *</span>
                    <input
                      className="field"
                      type="email"
                      name="email"
                      autoComplete="email"
                      required
                      placeholder="jane@company.com"
                    />
                  </label>
                </div>
                <label className="flex flex-col">
                  <span className="caption text-muted">Company</span>
                  <input
                    className="field"
                    name="company"
                    autoComplete="organization"
                    placeholder="Company name"
                  />
                </label>

                <fieldset>
                  <legend className="caption text-muted mb-4">
                    What do you need?
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {services.map((service) => (
                      <label key={service.id} className="toggle">
                        <input
                          type="checkbox"
                          name="services"
                          value={service.title}
                        />
                        <span>{service.title}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="caption text-muted mb-4">Budget</legend>
                  <div className="flex flex-wrap gap-2">
                    {BUDGETS.map((budget) => (
                      <label key={budget} className="toggle">
                        <input type="radio" name="budget" value={budget} />
                        <span>{budget}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <label className="flex flex-col">
                  <span className="caption text-muted">
                    Tell us about the project
                  </span>
                  <textarea
                    className="field"
                    name="message"
                    rows={4}
                    placeholder="Goals, timeline, links — anything that helps."
                  />
                </label>

                <div className="flex flex-wrap items-center justify-between gap-6">
                  <p className="caption text-muted max-w-[28ch]">
                    Submitting opens your email app with everything filled in.
                  </p>
                  <Magnetic>
                    <button type="submit" className="btn btn-primary">
                      Send inquiry
                      <span className="btn-icon">
                        <ArrowUpRight size={18} aria-hidden="true" />
                      </span>
                    </button>
                  </Magnetic>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
