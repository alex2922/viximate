"use client";

import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef } from "react";
import Roll from "@/components/ui/Roll";
import { VISUALS } from "@/components/visuals";
import { serviceHref, services } from "@/config/site";
import { gsap, useGSAP } from "@/lib/gsap";
import { registerScrollTarget } from "@/lib/scroll";

const HORIZONTAL_QUERY =
  "(min-width: 1024px) and (min-height: 640px) and (prefers-reduced-motion: no-preference)";

/**
 * Individual service showcases. On large screens the four panels travel
 * horizontally inside a pinned stage; on smaller screens (or with reduced
 * motion) they stack vertically as regular sections. Either way the stage
 * opens out of an inset card as it scrolls in.
 */
export default function Showcase() {
  const rootRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      const track = trackRef.current;
      if (!root || !track) return;
      const mm = gsap.matchMedia();

      // The stage opens from an inset card to the full screen as it arrives.
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const inset = () => Math.round(Math.min(56, window.innerWidth * 0.04));
        gsap.fromTo(
          root,
          {
            clipPath: () =>
              `inset(${inset()}px ${inset()}px 0px ${inset()}px round 28px)`,
          },
          {
            clipPath: "inset(0px 0px 0px 0px round 0px)",
            ease: "none",
            scrollTrigger: {
              trigger: root,
              start: "top bottom",
              end: "top top",
              scrub: true,
              invalidateOnRefresh: true,
            },
          },
        );
      });

      mm.add(HORIZONTAL_QUERY, () => {
        const panels = gsap.utils.toArray<HTMLElement>(".svc-panel", track);
        const distance = () => track.scrollWidth - root.clientWidth;

        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            onUpdate: (self) => {
              if (barRef.current)
                barRef.current.style.transform = `scaleX(${self.progress})`;
              const index = Math.min(
                panels.length - 1,
                Math.round(self.progress * (panels.length - 1)),
              );
              root.dataset.active = services[index].id;
            },
          },
        });

        // Visuals drift against the travel direction for depth.
        for (const panel of panels) {
          const visual = panel.querySelector(".svc-panel-visual");
          const copy = panel.querySelector(".svc-panel-copy");
          if (visual) {
            gsap.fromTo(
              visual,
              { xPercent: 6 },
              {
                xPercent: -6,
                ease: "none",
                scrollTrigger: {
                  trigger: panel,
                  containerAnimation: tween,
                  start: "left right",
                  end: "right left",
                  scrub: true,
                },
              },
            );
          }
          if (copy) {
            gsap.from(copy.children, {
              x: 80,
              autoAlpha: 0,
              stagger: 0.06,
              ease: "power2.out",
              scrollTrigger: {
                trigger: panel,
                containerAnimation: tween,
                start: "left 75%",
                end: "left 25%",
                scrub: true,
              },
            });
          }
        }

        const st = tween.scrollTrigger;
        const unregister = services.map((service, i) =>
          registerScrollTarget(`service-${service.id}`, () => {
            if (!st) return 0;
            return st.start + ((st.end - st.start) * i) / (services.length - 1);
          }),
        );

        return () => {
          for (const off of unregister) off();
        };
      });

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  // Panel activation (drives CSS assembly of each visual) + pointer parallax.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const panels = Array.from(root.querySelectorAll<HTMLElement>(".svc-panel"));

    for (const layer of root.querySelectorAll<HTMLElement>("[data-depth]")) {
      layer.style.setProperty("--d", layer.dataset.depth ?? "1");
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          (entry.target as HTMLElement).dataset.active = String(
            entry.isIntersecting,
          );
        }
      },
      { threshold: 0.25 },
    );
    for (const panel of panels) io.observe(panel);

    const fine = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    const cleanups: (() => void)[] = [];
    if (fine.matches) {
      for (const stage of root.querySelectorAll<HTMLElement>(".vis")) {
        let frame = 0;
        const onMove = (event: PointerEvent) => {
          cancelAnimationFrame(frame);
          frame = requestAnimationFrame(() => {
            const rect = stage.getBoundingClientRect();
            stage.style.setProperty(
              "--px",
              (((event.clientX - rect.left) / rect.width) * 2 - 1).toFixed(3),
            );
            stage.style.setProperty(
              "--py",
              (((event.clientY - rect.top) / rect.height) * 2 - 1).toFixed(3),
            );
          });
        };
        const onLeave = () => {
          cancelAnimationFrame(frame);
          stage.style.setProperty("--px", "0");
          stage.style.setProperty("--py", "0");
        };
        stage.addEventListener("pointermove", onMove);
        stage.addEventListener("pointerleave", onLeave);
        cleanups.push(() => {
          stage.removeEventListener("pointermove", onMove);
          stage.removeEventListener("pointerleave", onLeave);
        });
      }
    }

    return () => {
      io.disconnect();
      for (const c of cleanups) c();
    };
  }, []);

  return (
    <section
      ref={rootRef}
      id="showcase"
      aria-label="Service showcase"
      className="svc-showcase relative"
      data-active={services[0].id}
    >
      <div ref={trackRef} className="svc-track">
        {services.map((service) => {
          const Visual = VISUALS[service.id];
          return (
            <article
              key={service.id}
              id={`service-${service.id}`}
              className="svc-panel"
              data-tone={service.tone}
              data-discipline={service.id}
              data-index={service.index}
              data-active="false"
              aria-labelledby={`service-${service.id}-title`}
            >
              <div className="shell svc-panel-inner">
                <header className="svc-panel-head">
                  <span className="figure svc-panel-index">
                    {service.index}
                  </span>
                  <h3
                    id={`service-${service.id}-title`}
                    className="h2 svc-panel-title"
                  >
                    {service.title}
                  </h3>
                  <a href={serviceHref(service)} className="btn svc-panel-more">
                    <Roll>{`See ${service.title}`}</Roll>
                    <span className="btn-icon">
                      <ArrowUpRight
                        size={18}
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                    </span>
                  </a>
                </header>
                <div className="svc-panel-copy">
                  <p className="lead text-muted svc-panel-what">
                    {service.what}
                  </p>
                  <div className="svc-panel-facts">
                    <div>
                      <h4 className="svc-panel-label">What we deliver</h4>
                      <ul className="flex flex-col gap-2">
                        {service.deliver.map((item) => (
                          <li key={item} className="body svc-panel-item">
                            <span className="svc-bullet" aria-hidden="true" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="svc-panel-label">How it helps</h4>
                      <p className="body text-muted">{service.helps}</p>
                    </div>
                  </div>
                </div>
                <div className="svc-panel-visual">
                  <Visual />
                  <p className="caption text-muted svc-panel-note">
                    Illustrative interface, sample data
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <nav className="svc-hud" aria-label="Services">
        <div className="shell svc-hud-inner">
          <span className="svc-hud-track" aria-hidden="true">
            <span ref={barRef} className="svc-hud-bar" />
          </span>
          <ul className="svc-hud-list">
            {services.map((service) => (
              <li key={service.id}>
                <a
                  href={`#service-${service.id}`}
                  className="caption svc-hud-label"
                  data-id={service.id}
                >
                  {service.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </section>
  );
}
