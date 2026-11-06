import { Plus } from "lucide-react";
import ShapePit from "@/components/motion/ShapePit";
import SectionHeader from "@/components/ui/SectionHeader";

type FaqProps = {
  items: { q: string; a: string }[];
  title?: string[];
};

/** Questions as native disclosures: keyboard and screen-reader ready as is. */
export default function Faq({
  items,
  title = ["Questions,", "answered."],
}: FaqProps) {
  return (
    <section aria-labelledby="faq-title" className="section">
      <div className="shell faq-layout">
        <div className="faq-side">
          <SectionHeader id="faq-title" title={title} />
          <ShapePit
            items={[
              { tone: "web" },
              { tone: "ai", round: true },
              { tone: "growth" },
              { tone: "app", round: true },
            ]}
          />
        </div>
        <div className="faq-list">
          {items.map((item) => (
            <details key={item.q} className="faq-item" data-reveal="up">
              <summary className="faq-q">
                <span className="h3">{item.q}</span>
                <span className="faq-icon" aria-hidden="true">
                  <Plus size={18} strokeWidth={1.75} />
                </span>
              </summary>
              <p className="body text-muted faq-a">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
