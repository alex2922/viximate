import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Reveals from "@/components/motion/Reveals";
import PageHead from "@/components/pages/PageHead";
import BlockArt from "@/components/visuals/BlockArt";
import { serviceHref, services } from "@/config/site";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Web development, app development, automation and AI, and digital growth, built by one team as one connected system.",
};

export default function ServicesPage() {
  return (
    <main id="main" tabIndex={-1}>
      <PageHead
        title={["Four disciplines.", "One connected system."]}
        lead="Most businesses hire a different vendor for each of these. We build all four as one, so every part makes the others stronger."
        figure="system"
        caption="Four disciplines, held together by one team."
      />

      <section aria-label="Our services" className="section svc-index">
        <div className="shell">
          <ul className="svc-index-list">
            {services.map((service) => (
              <li key={service.id} data-reveal="up">
                <a
                  href={serviceHref(service)}
                  className="svc-index-row"
                  data-discipline={service.id}
                  data-tone={service.id}
                  data-assemble=""
                  data-cursor="label"
                  data-cursor-label="Explore"
                >
                  <BlockArt id={service.id} />
                  <span className="svc-index-main">
                    <span className="h2 svc-index-title">{service.title}</span>
                    <span className="lead text-muted">{service.what}</span>
                  </span>
                  <ul className="svc-index-deliver">
                    {service.deliver.map((item) => (
                      <li key={item} className="body">
                        {item}
                      </li>
                    ))}
                  </ul>
                  <span className="svc-row-arrow" aria-hidden="true">
                    <ArrowUpRight size={20} strokeWidth={1.75} />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Reveals />
    </main>
  );
}
