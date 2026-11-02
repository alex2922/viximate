import { ArrowUp } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { navItems, services, site } from "@/config/site";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t hairline pt-20 pb-6 md:pt-28">
      <div className="shell">
        <div className="grid grid-cols-2 gap-12 md:grid-cols-12 md:gap-6">
          <div className="col-span-2 md:col-span-5">
            <Logo />
            <p className="body text-muted mt-6 max-w-[36ch]">
              {site.description}
            </p>
          </div>
          <nav aria-label="Footer" className="md:col-span-2">
            <p className="caption text-muted mb-5">Navigate</p>
            <ul className="flex flex-col gap-2">
              {navItems.map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`} className="body link-line">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="md:col-span-3">
            <p className="caption text-muted mb-5">Services</p>
            <ul className="flex flex-col gap-2">
              {services.map((service) => (
                <li key={service.id}>
                  <a href={`#service-${service.id}`} className="body link-line">
                    {service.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-span-2 md:col-span-2">
            <p className="caption text-muted mb-5">Say hello</p>
            <a
              href={`mailto:${site.email}`}
              className="body link-line break-all"
            >
              {site.email}
            </a>
          </div>
        </div>
      </div>

      <div className="footer-mark mt-20 md:mt-28" aria-hidden="true">
        <span className="footer-word">viximate</span>
      </div>

      <div className="shell mt-6 flex items-center justify-between gap-6 border-t hairline pt-6">
        <p className="caption text-muted">
          © {site.year} {site.name}
        </p>
        <a
          href="#top"
          className="caption link-line inline-flex items-center gap-2"
        >
          Back to top <ArrowUp size={14} aria-hidden="true" />
        </a>
      </div>
    </footer>
  );
}
