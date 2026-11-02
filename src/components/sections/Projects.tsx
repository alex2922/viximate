import { ArrowUpRight } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import {
  type Project,
  type ProjectCover,
  projects,
  services,
} from "@/config/site";

function Cover({ kind }: { kind: ProjectCover }) {
  return (
    <svg
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
      aria-hidden="true"
    >
      <rect width="400" height="300" fill="var(--cs-surface)" />
      {kind === "grid" ? (
        <g stroke="var(--cs-line-strong)">
          {Array.from({ length: 11 }, (_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static pattern
            <line key={`v${i}`} x1={i * 40} x2={i * 40} y1="0" y2="300" />
          ))}
          {Array.from({ length: 8 }, (_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static pattern
            <line key={`h${i}`} y1={i * 40} y2={i * 40} x1="0" x2="400" />
          ))}
          <rect
            x="120"
            y="80"
            width="160"
            height="120"
            fill="var(--cs-accent)"
            stroke="none"
          />
        </g>
      ) : null}
      {kind === "orbit" ? (
        <g fill="none" stroke="var(--cs-accent-2)">
          {[40, 80, 120, 160].map((r) => (
            <circle key={r} cx="200" cy="150" r={r} opacity={1 - r / 220} />
          ))}
          <circle cx="200" cy="150" r="22" fill="var(--cs-accent-2)" />
          <circle
            cx="320"
            cy="150"
            r="8"
            fill="var(--cs-foreground)"
            stroke="none"
          />
        </g>
      ) : null}
      {kind === "wave" ? (
        <g fill="none" stroke="var(--cs-accent)" strokeWidth="1.5">
          {Array.from({ length: 9 }, (_, i) => (
            <path
              // biome-ignore lint/suspicious/noArrayIndexKey: static pattern
              key={i}
              d={`M0 ${80 + i * 18} C 100 ${40 + i * 18}, 200 ${160 + i * 14}, 400 ${90 + i * 18}`}
              opacity={0.25 + i * 0.08}
            />
          ))}
        </g>
      ) : null}
      {kind === "stack" ? (
        <g>
          {[0, 1, 2].map((i) => (
            <rect
              key={i}
              x={110 + i * 30}
              y={60 + i * 30}
              width="150"
              height="120"
              rx="8"
              fill={i === 2 ? "var(--cs-accent-2)" : "var(--cs-surface-2)"}
              stroke="var(--cs-line-strong)"
            />
          ))}
        </g>
      ) : null}
    </svg>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const serviceNames = project.services
    .map((id) => services.find((s) => s.id === id)?.short)
    .filter(Boolean);
  const body = (
    <>
      <div className="project-cover r">
        <Cover kind={project.cover} />
      </div>
      <div className="mt-5 flex items-start justify-between gap-6">
        <div>
          <p className="caption text-muted">
            {String(index + 1).padStart(2, "0")} · {project.client} ·{" "}
            {project.year}
          </p>
          <h3 className="lead font-semibold mt-2">{project.title}</h3>
        </div>
        {project.href ? (
          <ArrowUpRight
            className="mt-1 shrink-0"
            size={22}
            aria-hidden="true"
          />
        ) : null}
      </div>
      <ul className="mt-4 flex flex-wrap gap-2">
        {serviceNames.map((name) => (
          <li key={name} className="chip">
            {name}
          </li>
        ))}
      </ul>
    </>
  );

  return project.href ? (
    <a
      href={project.href}
      className="project-card block"
      data-cursor="label"
      data-cursor-label="View"
    >
      {body}
    </a>
  ) : (
    <div className="project-card">{body}</div>
  );
}

/**
 * Selected work. Rendered only when SHOW_PROJECTS is enabled in
 * src/config/site.ts — see app/page.tsx.
 */
export default function Projects({ index }: { index: string }) {
  return (
    <section id="work" aria-labelledby="work-title" className="section">
      <div className="shell">
        <SectionHeader
          index={index}
          eyebrow="Selected work"
          id="work-title"
          title={["Proof, not", "promises."]}
          description="A selection of platforms, products and campaigns we've engineered for ambitious teams."
        />
        <ul className="project-grid mt-16 md:mt-24">
          {projects.map((project, i) => (
            <li
              key={project.title}
              data-reveal="up"
              data-reveal-delay={(i % 2) * 0.1}
            >
              <ProjectCard project={project} index={i} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
