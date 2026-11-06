import { ArrowUpRight } from "lucide-react";
import ServicesMotion from "@/components/sections/ServicesMotion";
import SectionHeader from "@/components/ui/SectionHeader";
import BlockArt from "@/components/visuals/BlockArt";
import { serviceHref, services } from "@/config/site";

export default function Services() {
  return (
    <section
      id="services"
      aria-labelledby="services-title"
      className="section services"
    >
      <div className="shell">
        <SectionHeader
          id="services-title"
          title={["Four disciplines.", "One connected system."]}
          description="Most businesses juggle separate vendors for their website, app, automation and marketing. We bring them into one team and one strategy."
        />

        <div className="svc-tiles">
          <div className="svc-wire" aria-hidden="true">
            <span className="svc-wire-fill" />
            <span className="caption svc-wire-end" data-on="true">
              One system
            </span>
          </div>
          <ul className="svc-tile-list">
            {services.map((service) => (
              <li key={service.id}>
                <a
                  href={serviceHref(service)}
                  className="svc-tile"
                  data-tone={service.id}
                  data-on="true"
                  data-cursor="label"
                  data-cursor-label="Explore"
                >
                  <span className="svc-tile-top">
                    <span className="figure svc-tile-index">
                      {service.index}
                    </span>
                    <span className="svc-tile-arrow" aria-hidden="true">
                      <ArrowUpRight size={20} strokeWidth={2} />
                    </span>
                  </span>
                  <BlockArt id={service.id} />
                  <span className="svc-tile-title">{service.title}</span>
                  <span className="body text-muted">{service.summary}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        <ServicesMotion />
      </div>
    </section>
  );
}
