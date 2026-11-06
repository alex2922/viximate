"use client";

import { ArrowUpRight, Mail } from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import Magnetic from "@/components/motion/Magnetic";
import PageBlocks from "@/components/pages/PageBlocks";
import Roll from "@/components/ui/Roll";
import SplitText from "@/components/ui/SplitText";
import BlockArt from "@/components/visuals/BlockArt";
import { budgets, services, site } from "@/config/site";

type Status = "idle" | "handoff";

/**
 * Project inquiry. There is no backend yet (data-endpoint is empty), so
 * submitting composes a pre-filled email in the visitor's own mail app.
 * Nothing is sent from the page, and the confirmation says so.
 */
type ContactProps = {
  /** "h1" when the form is the page, as on /contact. */
  heading?: "h1" | "h2";
};

export default function Contact({ heading = "h2" }: ContactProps) {
  const [status, setStatus] = useState<Status>("idle");
  const formRef = useRef<HTMLFormElement>(null);

  // Arriving from a service page (?service=web) ticks that service.
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("service");
    if (!id || !formRef.current) return;
    const box = formRef.current.querySelector<HTMLInputElement>(
      `input[name="services"][data-id="${CSS.escape(id)}"]`,
    );
    if (box) box.checked = true;
  }, []);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) {
      form.querySelector<HTMLElement>(":invalid")?.focus();
      return;
    }
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

    const subject = `Project inquiry from ${name}${company ? ` (${company})` : ""}`;
    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
    setStatus("handoff");
  };

  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      data-blocks={heading === "h1" ? "" : undefined}
      className={
        heading === "h1" ? "section contact contact--page" : "section contact"
      }
    >
      {heading === "h1" ? <PageBlocks figure="talk" steady /> : null}
      <div className="shell contact-grid">
        <div className="contact-intro">
          <SplitText
            id="contact-title"
            as={heading}
            lines={["Let’s build", "what’s next."]}
            className={heading === "h1" ? "h1" : "h2"}
          />
          <p className="lead text-muted contact-line" data-reveal="up">
            Tell us where you are and where you want to be. We reply with ideas,
            not a sales script.
          </p>
          <a
            href={`mailto:${site.email}`}
            className="contact-mail link-line"
            data-reveal="up"
          >
            {site.email}
          </a>
          {heading === "h1" ? (
            <div
              className="contact-figure"
              data-blocks-frame=""
              data-cursor="label"
              data-cursor-label="Knock it"
            >
              <BlockArt id="talk" />
            </div>
          ) : null}
        </div>

        <div className="contact-panel">
          {status === "handoff" ? (
            // biome-ignore lint/a11y/useSemanticElements: live hand-off note with rich content
            <div className="contact-done" role="status">
              <span className="contact-done-icon">
                <Mail size={20} aria-hidden="true" />
              </span>
              <p className="h3">Your email app has the brief.</p>
              <p className="body text-muted">
                Nothing has been sent yet. Press send in the draft that opened,
                or write to{" "}
                <a
                  href={`mailto:${site.email}`}
                  className="link-line text-cs-foreground"
                >
                  {site.email}
                </a>{" "}
                if no draft appeared.
              </p>
              <button
                type="button"
                className="btn"
                onClick={() => setStatus("idle")}
              >
                <Roll>Edit the brief</Roll>
                <span className="btn-icon">
                  <ArrowUpRight size={18} aria-hidden="true" />
                </span>
              </button>
            </div>
          ) : (
            <form
              ref={formRef}
              className="contact-form"
              onSubmit={onSubmit}
              noValidate
              data-endpoint=""
              data-reveal="up"
            >
              <div className="contact-row">
                <label className="contact-field">
                  <span className="caption">Your name</span>
                  <input
                    className="field"
                    name="name"
                    autoComplete="name"
                    required
                    placeholder="Full name"
                  />
                </label>
                <label className="contact-field">
                  <span className="caption">Email</span>
                  <input
                    className="field"
                    type="email"
                    name="email"
                    inputMode="email"
                    autoComplete="email"
                    required
                    placeholder="you@company.com"
                  />
                </label>
              </div>
              <label className="contact-field">
                <span className="caption">
                  Company <span className="text-muted">(optional)</span>
                </span>
                <input
                  className="field"
                  name="company"
                  autoComplete="organization"
                  placeholder="Company name"
                />
              </label>

              <fieldset className="contact-field">
                <legend className="caption">What do you need?</legend>
                <div className="contact-toggles">
                  {services.map((service) => (
                    <label key={service.id} className="toggle">
                      <input
                        type="checkbox"
                        name="services"
                        value={service.title}
                        data-id={service.id}
                      />
                      <span>{service.title}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className="contact-field">
                <legend className="caption">Budget</legend>
                <div className="contact-toggles">
                  {budgets.map((budget) => (
                    <label key={budget} className="toggle">
                      <input type="radio" name="budget" value={budget} />
                      <span>{budget}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <label className="contact-field">
                <span className="caption">About the project</span>
                <textarea
                  className="field"
                  name="message"
                  rows={4}
                  placeholder="Goals, timeline, links: anything that helps."
                />
              </label>

              <div className="contact-submit">
                <p className="caption text-muted">
                  Sending opens your email app with the brief filled in.
                </p>
                <Magnetic>
                  <button type="submit" className="btn btn-primary">
                    <Roll>Send inquiry</Roll>
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
    </section>
  );
}
