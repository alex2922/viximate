"use client";

import { ArrowUpRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Magnetic from "@/components/motion/Magnetic";
import Logo from "@/components/ui/Logo";
import Roll from "@/components/ui/Roll";
import { navItems, site } from "@/config/site";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { getLenis } from "@/lib/scroll";

const FOCUSABLE =
  'a[href], button:not([disabled]), input, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Header: the mark on the left, one action and the menu toggle on the right.
 * Every destination lives in the full-screen menu, at every screen size.
 */
export default function Nav() {
  const headerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Hide on scroll down, return on scroll up; take a backdrop past the top.
  useGSAP(() => {
    const header = headerRef.current;
    if (!header) return;
    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        const y = self.scroll();
        header.dataset.scrolled = String(y > 24);
        if (open) return;
        const hide = self.direction === 1 && y > window.innerHeight * 0.6;
        gsap.to(header, {
          yPercent: hide ? -110 : 0,
          duration: 0.5,
          ease: "expo.out",
          overwrite: "auto",
        });
      },
    });
    return () => st.kill();
  }, [open]);

  // The menu marks the page you are on; a section's pages count as it.
  const isCurrent = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  // Open and close the menu.
  useGSAP(
    () => {
      const menu = menuRef.current;
      if (!menu) return;
      const lenis = getLenis();
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (open) {
        lenis?.stop();
        document.documentElement.dataset.menu = "open";
        gsap.set(headerRef.current, { yPercent: 0 });
        gsap.set(menu, { display: "flex" });
        if (reduced) {
          gsap.fromTo(menu, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 });
        } else {
          gsap.fromTo(
            menu,
            { clipPath: "inset(0 0 100% 0)", autoAlpha: 1 },
            { clipPath: "inset(0 0 0% 0)", duration: 0.75, ease: "expo.inOut" },
          );
          gsap.fromTo(
            ".menu-item",
            { yPercent: 110 },
            {
              yPercent: 0,
              duration: 0.9,
              ease: "expo.out",
              stagger: 0.06,
              delay: 0.35,
            },
          );
          gsap.fromTo(
            ".menu-aside",
            { autoAlpha: 0, y: 12 },
            { autoAlpha: 1, y: 0, duration: 0.6, delay: 0.7, stagger: 0.06 },
          );
        }
        menu
          .querySelector<HTMLAnchorElement>(".menu-item")
          ?.focus({ preventScroll: true });
      } else if (menu.style.display === "flex") {
        lenis?.start();
        delete document.documentElement.dataset.menu;
        if (!reduced) {
          gsap.to(".menu-item", {
            yPercent: -110,
            duration: 0.4,
            ease: "expo.in",
            stagger: 0.03,
          });
        }
        gsap.to(menu, {
          ...(reduced
            ? { autoAlpha: 0, duration: 0.15 }
            : { clipPath: "inset(0 0 100% 0)", duration: 0.65, delay: 0.25 }),
          ease: "expo.inOut",
          onComplete: () => {
            gsap.set(menu, { display: "none" });
          },
        });
      }
    },
    { dependencies: [open], scope: menuRef },
  );

  // Links close the menu; Escape closes it; Tab stays inside it.
  useEffect(() => {
    if (!open) return;
    const onLinkClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (target?.closest?.("#site-menu a, header a")) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (event.key !== "Tab" || !menuRef.current || !toggleRef.current) return;
      const items = [
        toggleRef.current,
        ...menuRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      ];
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("click", onLinkClick, true);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onLinkClick, true);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <header
        ref={headerRef}
        className="vx-nav"
        data-scrolled="false"
        data-open={open}
      >
        <div className="shell vx-nav-inner">
          <a href="/" className="vx-nav-home" aria-label={`${site.name}, home`}>
            <Logo />
          </a>

          <div className="vx-nav-actions">
            <Magnetic>
              <a
                href={site.cta.href}
                className="btn btn-primary btn-sm vx-nav-cta"
              >
                <Roll>{site.cta.label}</Roll>
                <span className="btn-icon">
                  <ArrowUpRight size={16} strokeWidth={2} aria-hidden="true" />
                </span>
              </a>
            </Magnetic>
            <button
              ref={toggleRef}
              type="button"
              className="vx-menu-toggle"
              aria-expanded={open}
              aria-controls="site-menu"
              onClick={() => setOpen((v) => !v)}
            >
              <span className="vx-menu-toggle-label">
                {open ? "Close" : "Menu"}
              </span>
              <span className="vx-menu-toggle-icon" aria-hidden="true">
                <span />
                <span />
              </span>
            </button>
          </div>
        </div>
      </header>

      <div
        ref={menuRef}
        id="site-menu"
        className="vx-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        inert={!open}
      >
        <nav aria-label="Primary" className="vx-menu-nav">
          <ul className="vx-menu-list">
            {navItems.map((item, i) => (
              <li key={item.href} className="split-line">
                <a
                  href={item.href}
                  className="menu-item"
                  aria-current={isCurrent(item.href) ? "page" : undefined}
                >
                  <Roll letters>{item.label}</Roll>
                  <span className="figure menu-item-index" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="shell vx-menu-foot">
          <a
            href={`mailto:${site.email}`}
            className="menu-aside menu-foot-link"
          >
            <Roll>{site.email}</Roll>
          </a>
          <p className="menu-aside menu-foot-note">{site.motto}</p>
          <a href={site.cta.href} className="menu-aside menu-foot-link">
            <Roll>{site.cta.label}</Roll>
            <ArrowUpRight size={16} strokeWidth={2} aria-hidden="true" />
          </a>
        </div>
      </div>
    </>
  );
}
