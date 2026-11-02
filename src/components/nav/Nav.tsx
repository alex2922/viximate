"use client";

import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Magnetic from "@/components/motion/Magnetic";
import Logo from "@/components/ui/Logo";
import { navItems, site } from "@/config/site";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { getLenis } from "@/lib/scroll";

export default function Nav() {
  const headerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Hide on scroll down, reveal on scroll up; solidify after the hero.
  useGSAP(() => {
    const header = headerRef.current;
    if (!header) return;
    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        const y = self.scroll();
        header.dataset.scrolled = String(y > 40);
        if (open) return;
        const hide = self.direction === 1 && y > window.innerHeight * 0.6;
        gsap.to(header, {
          yPercent: hide ? -110 : 0,
          duration: 0.6,
          ease: "expo.out",
          overwrite: "auto",
        });
      },
    });
    return () => st.kill();
  }, [open]);

  // Track which section is in view for the active nav state.
  useEffect(() => {
    const ids = navItems.map((item) => item.id);
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    for (const section of sections) observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // Mobile menu: lock scroll, animate, trap Escape.
  useGSAP(
    () => {
      const menu = menuRef.current;
      if (!menu) return;
      const lenis = getLenis();
      if (open) {
        lenis?.stop();
        document.body.style.overflow = "hidden";
        gsap.set(menu, { display: "flex" });
        gsap.fromTo(
          menu,
          { clipPath: "inset(0 0 100% 0)" },
          { clipPath: "inset(0 0 0% 0)", duration: 0.9, ease: "expo.inOut" },
        );
        gsap.fromTo(
          ".menu-item",
          { yPercent: 110 },
          {
            yPercent: 0,
            duration: 1,
            ease: "expo.out",
            stagger: 0.06,
            delay: 0.35,
          },
        );
        gsap.fromTo(
          ".menu-meta",
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.6, delay: 0.6 },
        );
        menu
          .querySelector<HTMLAnchorElement>("a")
          ?.focus({ preventScroll: true });
      } else if (menu.style.display === "flex") {
        lenis?.start();
        document.body.style.overflow = "";
        gsap.to(menu, {
          clipPath: "inset(0 0 100% 0)",
          duration: 0.7,
          ease: "expo.inOut",
          onComplete: () => {
            gsap.set(menu, { display: "none" });
          },
        });
      }
    },
    { dependencies: [open], scope: menuRef },
  );

  useEffect(() => {
    if (!open) return;
    // Any in-page link (menu items, logo, CTA) closes the menu.
    const onLinkClick = (event: MouseEvent) => {
      if ((event.target as Element | null)?.closest?.("a[href^='#']"))
        setOpen(false);
    };
    document.addEventListener("click", onLinkClick, true);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onLinkClick, true);
    };
  }, [open]);

  return (
    <>
      <header
        ref={headerRef}
        className="vx-nav fixed inset-x-0 top-0 z-[120]"
        data-scrolled="false"
      >
        <div className="shell relative z-10 flex h-[var(--cs-nav-h)] items-center justify-between gap-6">
          <a
            href="#top"
            className="flex items-center gap-2.5"
            aria-label={`${site.name} — back to top`}
          >
            <Logo />
          </a>

          <nav aria-label="Primary" className="hidden md:block">
            <ul className="vx-nav-pill flex items-center gap-1">
              {navItems.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="vx-nav-link"
                    data-active={activeId === item.id}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <Magnetic>
              <a href="#contact" className="btn btn-primary h-11 pl-4 text-sm">
                Start a Project
                <span className="btn-icon h-8 w-8">
                  <ArrowUpRight size={16} aria-hidden="true" />
                </span>
              </a>
            </Magnetic>
            <button
              ref={toggleRef}
              type="button"
              className="vx-menu-toggle md:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <div
        ref={menuRef}
        id="mobile-menu"
        className="vx-menu fixed inset-0 z-[110] hidden flex-col justify-between bg-cs-background px-[var(--cs-gutter)] pt-[calc(var(--cs-nav-h)+2rem)] pb-8 md:hidden"
        inert={!open}
      >
        <nav aria-label="Mobile">
          <ul className="flex flex-col gap-3">
            {navItems.map((item, i) => (
              <li key={item.id} className="split-line">
                <a
                  href={`#${item.id}`}
                  className="menu-item h2 flex items-baseline gap-4"
                >
                  <span className="caption text-cs-accent">0{i + 1}</span>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="menu-meta flex flex-col gap-6">
          <a href={`mailto:${site.email}`} className="lead link-line w-fit">
            {site.email}
          </a>
          <a href="#contact" className="btn btn-primary w-fit">
            Start a Project
            <span className="btn-icon">
              <ArrowUpRight size={18} aria-hidden="true" />
            </span>
          </a>
        </div>
      </div>
    </>
  );
}
