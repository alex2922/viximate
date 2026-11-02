import { ArrowUpRight } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import ServiceGlyph from "@/components/visuals/ServiceGlyph";
import { services } from "@/config/site";

export default function Services({ index }: { index: string }) {
  return (
    <section
      id="services"
      aria-labelledby="services-title"
      className="section pb-[clamp(4rem,8vw,7rem)]"
    >
      <div className="shell">
        <SectionHeader
          index={index}
          eyebrow="What we do"
          id="services-title"
          title={["Four disciplines.", "One connected system."]}
          description="Most businesses juggle separate vendors for their website, app, automation and marketing. We bring them into one team — and one strategy."
        />

        <ol className="mt-16 border-t hairline md:mt-24">
          {services.map((service) => (
            <li key={service.id} data-reveal="up">
              <a
                href={`#service-${service.id}`}
                className="svc-row"
                data-tone={service.tone}
                data-cursor="label"
                data-cursor-label="Explore"
              >
                <span className="svc-row-fill" aria-hidden="true" />
                <span className="caption svc-row-index">{service.index}</span>
                <span className="h3 svc-row-title">{service.title}</span>
                <span className="body svc-row-summary">{service.summary}</span>
                <span className="svc-row-glyph" aria-hidden="true">
                  <ServiceGlyph id={service.id} />
                </span>
                <span className="svc-row-arrow" aria-hidden="true">
                  <ArrowUpRight size={22} strokeWidth={1.75} />
                </span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
