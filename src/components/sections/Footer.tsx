import { ArrowUp, ArrowUpRight } from "lucide-react";
import FooterMotion from "@/components/sections/FooterMotion";
import FooterPit from "@/components/sections/FooterPit";
import Roll from "@/components/ui/Roll";
import {
  navItems,
  processSteps,
  serviceHref,
  services,
  site,
} from "@/config/site";

const CLOSE = ["Let’s build", "it together"];

/** The close: one invitation, the links on the grid, then the pit. */
export default function Footer() {
  return (
    <footer className="footer">
      <div className="shell footer-inner">
        <a href="/contact" className="footer-close">
          <span className="sr-only">{CLOSE.join(" ")}, start a project</span>
          <span className="footer-close-text" aria-hidden="true">
            {CLOSE.map((line) => (
              <span key={line} className="close-line">
                {line}
              </span>
            ))}
          </span>
          <span className="footer-close-icon" aria-hidden="true">
            <ArrowUpRight size={22} strokeWidth={2} />
          </span>
        </a>

        <div className="footer-top">
          <div className="footer-brand">
            <p className="lead footer-line">
              A technology studio engineering websites, apps, automation and
              growth as one connected system.
            </p>
          </div>

          <nav className="footer-cols" aria-label="Footer">
            <div>
              <h2 className="caption text-muted">Explore</h2>
              <ul>
                {navItems.map((item) => (
                  <li key={item.href}>
                    <a href={item.href} className="footer-link">
                      <Roll>{item.label}</Roll>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="caption text-muted">Services</h2>
              <ul>
                {services.map((service) => (
                  <li key={service.id}>
                    <a href={serviceHref(service)} className="footer-link">
                      <Roll>{service.title}</Roll>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="caption text-muted">How we work</h2>
              <ul>
                {processSteps.map((step) => (
                  <li key={step.index}>
                    <a href="/about#approach" className="footer-link">
                      <Roll>{step.title}</Roll>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="caption text-muted">Say hello</h2>
              <ul>
                <li>
                  <a href={`mailto:${site.email}`} className="footer-link">
                    <Roll>{site.email}</Roll>
                  </a>
                </li>
                <li>
                  <a href={site.cta.href} className="footer-link">
                    <Roll>{site.cta.label}</Roll>
                  </a>
                </li>
              </ul>
            </div>
          </nav>
        </div>
      </div>

      <FooterPit />

      <div className="shell footer-legal">
        <p className="caption text-muted">
          © {site.year} {site.name}. {site.tagline}.
        </p>
        <a href="#top" className="caption link-line footer-top-link">
          Back to top
          <ArrowUp size={14} aria-hidden="true" />
        </a>
      </div>
      <FooterMotion />
    </footer>
  );
}
