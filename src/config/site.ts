/**
 * Central site configuration.
 * Content, feature flags and navigation live here so sections stay dumb.
 */

/**
 * Selected Projects section.
 * `false` removes the section (and its nav link) from the rendered page entirely.
 * Flip to `true` once real case studies are added to `projects` below.
 */
export const SHOW_PROJECTS = false;

export const site = {
  name: "Viximate",
  tagline: "Technology-driven digital agency",
  description:
    "Viximate is a technology-led studio engineering websites, apps, AI automation and growth systems that work as one connected digital ecosystem.",
  email: "hello@viximate.com",
  year: 2026,
} as const;

export type NavItem = { label: string; id: string };

const allNavItems: (NavItem & { requiresProjects?: boolean })[] = [
  { label: "Services", id: "services" },
  { label: "Work", id: "work", requiresProjects: true },
  { label: "Approach", id: "approach" },
  { label: "Why us", id: "why" },
  { label: "Contact", id: "contact" },
];

export const navItems: NavItem[] = allNavItems
  .filter((item) => !item.requiresProjects || SHOW_PROJECTS)
  .map(({ label, id }) => ({ label, id }));

export type ServiceId = "web" | "app" | "ai" | "growth";
export type Tone = "accent" | "accent-2";

export type Service = {
  id: ServiceId;
  index: string;
  title: string;
  short: string;
  summary: string;
  what: string;
  deliver: string[];
  helps: string;
  tags: string[];
  tone: Tone;
};

export const services: Service[] = [
  {
    id: "web",
    index: "01",
    title: "Web Development",
    short: "Web",
    summary: "Websites, web applications and e-commerce.",
    what: "High-performance websites, web applications and commerce platforms — engineered for speed, search and conversion.",
    deliver: [
      "Marketing sites & landing pages",
      "Web apps & dashboards",
      "E-commerce & headless storefronts",
      "CMS, APIs & integrations",
    ],
    helps:
      "A fast, credible platform that turns visitors into customers — and scales as your business does.",
    tags: ["Next.js", "Commerce", "CMS"],
    tone: "accent",
  },
  {
    id: "app",
    index: "02",
    title: "App Development",
    short: "Apps",
    summary: "iOS, Android and cross-platform applications.",
    what: "Native-quality iOS, Android and cross-platform apps, designed around how people actually use their phones.",
    deliver: [
      "iOS & Android apps",
      "Cross-platform builds",
      "Product UX & prototyping",
      "Store launch & maintenance",
    ],
    helps:
      "Your product in your customers' pockets — an experience they open daily, not once.",
    tags: ["iOS", "Android", "React Native"],
    tone: "accent-2",
  },
  {
    id: "ai",
    index: "03",
    title: "Automation & AI",
    short: "AI",
    summary: "Business automation, AI integrations and custom workflows.",
    what: "Workflows, integrations and AI systems that take repetitive work off your team and make operations smarter.",
    deliver: [
      "Business process automation",
      "AI assistants & agents",
      "LLM integrations & custom tools",
      "CRM, data & API pipelines",
    ],
    helps:
      "Hours back every week, fewer manual errors, and decisions backed by your own data.",
    tags: ["Agents", "Workflows", "Integrations"],
    tone: "accent",
  },
  {
    id: "growth",
    index: "04",
    title: "Digital Growth",
    short: "Growth",
    summary: "Social media, content strategy and digital marketing.",
    what: "Social media, content and performance marketing that builds an audience — and turns it into revenue.",
    deliver: [
      "Social media management",
      "Content strategy & production",
      "Paid & performance campaigns",
      "Analytics & reporting",
    ],
    helps:
      "Consistent visibility and a measurable pipeline — growth you can see in the numbers.",
    tags: ["Social", "Content", "Performance"],
    tone: "accent-2",
  },
];

export type ProcessStep = {
  index: string;
  title: string;
  text: string;
  outputs: string[];
};

export const processSteps: ProcessStep[] = [
  {
    index: "01",
    title: "Decode",
    text: "We dig into your business, your users and your market to find the opportunities that actually move the needle. Strategy before pixels.",
    outputs: ["Discovery workshop", "Technical audit", "Roadmap"],
  },
  {
    index: "02",
    title: "Design",
    text: "We shape the experience — flows, interfaces, content and motion — and put prototypes in front of real people early.",
    outputs: ["UX flows", "Interface design", "Prototype"],
  },
  {
    index: "03",
    title: "Engineer",
    text: "We build on modern, scalable stacks: clean code, automated testing and integrations that hold up under real traffic.",
    outputs: ["Development", "Integrations", "QA"],
  },
  {
    index: "04",
    title: "Evolve",
    text: "We launch, measure and keep improving. Your platform gets sharper every month instead of slowly going stale.",
    outputs: ["Launch", "Analytics", "Iteration"],
  },
];

export type Reason = { title: string; text: string };

export const reasons: Reason[] = [
  {
    title: "Engineering at the core",
    text: "We're technologists first. Every design decision is backed by code that's fast, secure and built to scale.",
  },
  {
    title: "One team, every channel",
    text: "Web, apps, automation and growth under one roof. No hand-offs, no lost context, no finger-pointing.",
  },
  {
    title: "AI-native by default",
    text: "Automation and AI shape how we work and what we build — so you move faster and spend less.",
  },
  {
    title: "Design with intent",
    text: "Distinctive, considered interfaces that make your brand hard to ignore and easy to use.",
  },
  {
    title: "Measured outcomes",
    text: "Clear goals, honest reporting and decisions grounded in data rather than opinion.",
  },
  {
    title: "Yours to own",
    text: "Clean, documented work you fully own. No lock-in, no black boxes, no surprises.",
  },
];

export type ProjectCover = "grid" | "orbit" | "wave" | "stack";

export type Project = {
  title: string;
  client: string;
  year: string;
  services: ServiceId[];
  cover: ProjectCover;
  /** Leave undefined until the case study page exists — the card then renders without a link. */
  href?: string;
};

/**
 * Sample entries so the layout can be previewed with SHOW_PROJECTS = true.
 * Replace with real case studies before enabling the section in production.
 */
export const projects: Project[] = [
  {
    title: "Commerce platform rebuild",
    client: "Retail",
    year: "2026",
    services: ["web", "growth"],
    cover: "grid",
  },
  {
    title: "Field-service mobile app",
    client: "Logistics",
    year: "2026",
    services: ["app", "ai"],
    cover: "orbit",
  },
  {
    title: "AI lead-qualification engine",
    client: "B2B SaaS",
    year: "2026",
    services: ["ai"],
    cover: "wave",
  },
  {
    title: "Launch campaign & content system",
    client: "Consumer brand",
    year: "2026",
    services: ["growth", "web"],
    cover: "stack",
  },
];

export const capabilities = [
  "Next.js",
  "React Native",
  "AI agents",
  "Automation",
  "E-commerce",
  "Content",
  "Performance marketing",
  "Analytics",
  "Integrations",
  "Product design",
];
