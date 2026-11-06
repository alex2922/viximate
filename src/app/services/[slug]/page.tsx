import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Reveals from "@/components/motion/Reveals";
import CtaBand from "@/components/pages/CtaBand";
import Faq from "@/components/pages/Faq";
import PageHead from "@/components/pages/PageHead";
import SectionHeader from "@/components/ui/SectionHeader";
import { VISUALS } from "@/components/visuals";
import {
  processSteps,
  serviceBySlug,
  serviceHref,
  services,
} from "@/config/site";

const SHAPE_TONES = ["web", "app", "ai", "growth"] as const;

// Unknown slugs fall through to notFound() below.
export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const service = serviceBySlug(slug);
  if (!service) return {};
  return { title: service.title, description: service.what };
}

/** The params are read inside the boundary, so the route keeps a static shell. */
export default function ServicePage({ params }: PageProps<"/services/[slug]">) {
  return (
    <Suspense
      fallback={<main id="main" tabIndex={-1} className="page-pending" />}
    >
      <Service params={params} />
    </Suspense>
  );
}

async function Service({
  params,
}: Pick<PageProps<"/services/[slug]">, "params">) {
  const { slug } = await params;
  const service = serviceBySlug(slug);
  if (!service) notFound();

  const Visual = VISUALS[service.id];
  const others = services.filter((s) => s.id !== service.id);

  return (
    <main id="main" tabIndex={-1} data-discipline={service.id}>
      <PageHead
        back={{ label: "All services", href: "/services" }}
        title={[service.title]}
        lead={service.what}
        figure={service.id}
        caption="One of four disciplines, built to work with the other three."
        meta={
          <ul className="chip-row" aria-label="Typical tools">
            {service.tags.map((tag) => (
              <li key={tag} className="chip">
                {tag}
              </li>
            ))}
          </ul>
        }
      />

      <section
        aria-label={`${service.title} in practice`}
        className="svc-stage"
      >
        <div className="shell">
          <div
            className="svc-stage-frame vis-host"
            data-active="true"
            data-tone={service.tone}
            data-discipline={service.id}
            data-reveal="up"
          >
            <Visual />
          </div>
        </div>
      </section>

      <section
        aria-labelledby="deliver-title"
        className="section"
        data-tone={service.tone}
      >
        <div className="shell svc-detail">
          <div>
            <h2 id="deliver-title" className="h2" data-reveal="up">
              What we deliver
            </h2>
            <ul className="svc-deliver">
              {service.deliver.map((item) => (
                <li key={item} className="h3 svc-deliver-item" data-reveal="up">
                  <span className="shape shape--sm" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="svc-helps" data-reveal="up">
            <h2 className="caption">How it helps</h2>
            <p className="statement">{service.helps}</p>
            <span className="post-card-art" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="connects-title"
        className="section svc-connects"
      >
        <div className="shell">
          <SectionHeader
            id="connects-title"
            title={["One part", "of the whole."]}
            description={`How ${service.title} feeds the rest of your system when one team builds all four.`}
          />
          <ul className="connect-grid">
            {others.map((other) => (
              <li key={other.id} data-reveal="up">
                <a
                  href={serviceHref(other)}
                  className="connect-card"
                  data-discipline={other.id}
                >
                  <span className="post-card-art" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </span>
                  <span className="connect-head">
                    <span className="h3">{other.title}</span>
                    <span className="connect-arrow" aria-hidden="true">
                      <ArrowUpRight size={18} strokeWidth={2} />
                    </span>
                  </span>
                  <span className="body">{service.connects[other.id]}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="steps-title" className="section">
        <div className="shell">
          <SectionHeader
            id="steps-title"
            title={["How a project", "runs."]}
            description="The same four steps for every discipline, so nothing is lost between them."
          />
          <ol className="step-strip">
            {processSteps.map((step, i) => (
              <li key={step.index} className="step-strip-item" data-reveal="up">
                <span
                  className="shape"
                  data-discipline={SHAPE_TONES[i % 4]}
                  data-shape={i % 2 ? "round" : "square"}
                >
                  {step.index}
                </span>
                <h3 className="h3">{step.title}</h3>
                <p className="body text-muted">{step.text}</p>
              </li>
            ))}
          </ol>
          <a
            href="/about#approach"
            className="caption page-more"
            data-reveal="up"
          >
            <span className="link-line">More on how we work</span>
            <ArrowUpRight size={14} strokeWidth={2} aria-hidden="true" />
          </a>
        </div>
      </section>

      <Faq items={service.faq} />

      <CtaBand
        title={["Talk to us about", `${service.title}.`]}
        line="Tell us what you have and where you want it to go. The brief takes a few minutes."
        label="Start a project"
        href={`/contact?service=${service.id}`}
      />

      <Reveals />
    </main>
  );
}
