import { ArrowUpRight } from "lucide-react";
import Magnetic from "@/components/motion/Magnetic";
import Roll from "@/components/ui/Roll";
import SplitText from "@/components/ui/SplitText";

type CtaBandProps = {
  title: string[];
  line: string;
  label: string;
  href: string;
};

/** The close of an inner page: one heading, one line, one action. */
export default function CtaBand({ title, line, label, href }: CtaBandProps) {
  return (
    <section aria-labelledby="cta-title" className="section cta-band">
      <div className="shell">
        <div className="cta-band-inner">
          <span className="post-card-art" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <SplitText id="cta-title" lines={title} className="h2" />
          <div className="cta-band-side" data-reveal="up">
            <p className="lead">{line}</p>
            <Magnetic>
              <a href={href} className="btn btn-primary">
                <Roll>{label}</Roll>
                <span className="btn-icon">
                  <ArrowUpRight size={18} strokeWidth={2} aria-hidden="true" />
                </span>
              </a>
            </Magnetic>
          </div>
        </div>
      </div>
    </section>
  );
}
