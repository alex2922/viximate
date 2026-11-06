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
  /** The brand line: "imagine" echoes the "-imate" in Viximate. */
  motto: "You imagine. We create.",
  description:
    "Viximate is a technology-led studio engineering websites, apps, AI automation and growth systems that work as one connected digital ecosystem.",
  email: "hello@viximate.com",
  /** Where the header and menu actions point. */
  cta: { label: "Start a project", href: "/contact" },
  year: 2026,
} as const;

export type NavItem = { label: string; href: string };

const allNavItems: (NavItem & { requiresProjects?: boolean })[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Work", href: "/#work", requiresProjects: true },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export const navItems: NavItem[] = allNavItems
  .filter((item) => !item.requiresProjects || SHOW_PROJECTS)
  .map(({ label, href }) => ({ label, href }));

export type ServiceId = "web" | "app" | "ai" | "growth";
export type Tone = "accent" | "accent-2";

export type Service = {
  id: ServiceId;
  /** The service page lives at /services/<slug>. */
  slug: string;
  index: string;
  title: string;
  short: string;
  summary: string;
  what: string;
  deliver: string[];
  helps: string;
  tags: string[];
  tone: Tone;
  /** How this discipline feeds each of the other three. */
  connects: Partial<Record<ServiceId, string>>;
  faq: { q: string; a: string }[];
};

export const services: Service[] = [
  {
    id: "web",
    slug: "web-development",
    index: "01",
    title: "Web Development",
    short: "Web",
    summary: "Websites, web applications and e-commerce.",
    what: "High-performance websites, web applications and commerce platforms, engineered for speed, search and conversion.",
    deliver: [
      "Marketing sites and landing pages",
      "Web apps and dashboards",
      "E-commerce and headless storefronts",
      "CMS, APIs and integrations",
    ],
    helps:
      "A fast, credible platform that turns visitors into customers and scales as your business does.",
    tags: ["Next.js", "Commerce", "CMS"],
    tone: "accent",
    connects: {
      app: "Shares one account system and one design language with your app, so customers move between them without starting over.",
      ai: "Every form, enquiry and order feeds straight into your automations instead of an inbox someone has to clear.",
      growth:
        "Built for search and tracking from day one, so every campaign lands on a page that converts and reports back.",
    },
    faq: [
      {
        q: "Do you build on templates?",
        a: "No. We design for your content and your customers, then build on a modern stack you own, with a CMS your team can edit.",
      },
      {
        q: "Can you take over a site that already exists?",
        a: "Yes. We start with an audit of speed, search and code, then decide together whether to improve it or rebuild.",
      },
      {
        q: "Who looks after it after launch?",
        a: "We can, on a monthly plan that covers updates, monitoring and steady improvements, or we hand over cleanly to your team.",
      },
    ],
  },
  {
    id: "app",
    slug: "app-development",
    index: "02",
    title: "App Development",
    short: "Apps",
    summary: "iOS, Android and cross-platform applications.",
    what: "Native-quality iOS, Android and cross-platform apps, designed around how people actually use their phones.",
    deliver: [
      "iOS and Android apps",
      "Cross-platform builds",
      "Product UX and prototyping",
      "Store launch and maintenance",
    ],
    helps:
      "Your product in your customers' pockets: an experience they open daily, not once.",
    tags: ["iOS", "Android", "React Native"],
    tone: "accent-2",
    connects: {
      web: "Runs on the same backend and accounts as your website, so data is written once and shows up everywhere.",
      ai: "Push notifications, reminders and support replies are triggered by your automations, not by hand.",
      growth:
        "Install, retention and in-app events flow into the same reporting as your campaigns.",
    },
    faq: [
      {
        q: "Native or cross-platform?",
        a: "It depends on what the app has to do. We recommend one after discovery, and explain the trade-off in cost, speed and feel.",
      },
      {
        q: "Do you handle the App Store and Play Store?",
        a: "Yes. We prepare the listings, handle review and release, and keep the app current with each new OS version.",
      },
      {
        q: "Can you start from our existing designs?",
        a: "Yes. We review them for flows and edge cases first, then build, or redesign the parts that will not hold up.",
      },
    ],
  },
  {
    id: "ai",
    slug: "automation-ai",
    index: "03",
    title: "Automation & AI",
    short: "AI",
    summary: "Business automation, AI integrations and custom workflows.",
    what: "Workflows, integrations and AI systems that take repetitive work off your team and make operations smarter.",
    deliver: [
      "Business process automation",
      "AI assistants and agents",
      "LLM integrations and custom tools",
      "CRM, data and API pipelines",
    ],
    helps:
      "Hours back every week, fewer manual errors, and decisions backed by your own data.",
    tags: ["Agents", "Workflows", "Integrations"],
    tone: "accent",
    connects: {
      web: "Reads every enquiry and order your website takes, then routes, answers or files it without waiting for a person.",
      app: "Powers the assistant inside your app and the notifications that bring people back to it.",
      growth:
        "Turns campaign leads into follow-ups within minutes and keeps your CRM clean enough to trust the numbers.",
    },
    faq: [
      {
        q: "Where should we start with automation?",
        a: "With the repetitive work your team already complains about. We map it, measure it, and automate the step that saves the most time first.",
      },
      {
        q: "Is our data safe with AI tools?",
        a: "We choose providers and settings with your data in mind, keep sensitive steps on systems you control, and document what goes where.",
      },
      {
        q: "Will it work with the tools we use now?",
        a: "Usually, yes. We connect your existing CRM, spreadsheets, inbox and payment tools before suggesting anything new.",
      },
    ],
  },
  {
    id: "growth",
    slug: "digital-growth",
    index: "04",
    title: "Digital Growth",
    short: "Growth",
    summary: "Social media, content strategy and digital marketing.",
    what: "Social media, content and performance marketing that builds an audience and turns it into revenue.",
    deliver: [
      "Social media management",
      "Content strategy and production",
      "Paid and performance campaigns",
      "Analytics and reporting",
    ],
    helps:
      "Consistent visibility and a measurable pipeline: growth you can see in the numbers.",
    tags: ["Social", "Content", "Performance"],
    tone: "accent-2",
    connects: {
      web: "Every campaign points at pages built to convert, and the site tells us which ones did.",
      app: "Campaigns that bring people into the app, then keep them opening it, measured in the same place.",
      ai: "Leads are scored and followed up automatically, so the team spends time on the ones ready to buy.",
    },
    faq: [
      {
        q: "Which channels do you work on?",
        a: "Instagram, LinkedIn, YouTube, search and paid social, chosen by where your customers already spend time.",
      },
      {
        q: "Do you make the content too?",
        a: "Yes. Strategy, writing, design and short video, produced in batches so your calendar never runs dry.",
      },
      {
        q: "How do we know it is working?",
        a: "You get one monthly report tied to enquiries and sales, not just likes, with what we will change next.",
      },
    ],
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
    text: "We shape the experience (flows, interfaces, content and motion) and put prototypes in front of real people early.",
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
    text: "Automation and AI shape how we work and what we build, so you move faster and spend less.",
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
    title: "Launch campaign and content system",
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

/** Budget bands for the inquiry form, in Indian rupees. */
export const budgets = [
  "Under ₹50,000",
  "₹50,000 to ₹1.5 lakh",
  "₹1.5 lakh to ₹5 lakh",
  "₹5 lakh and up",
  "Not sure yet",
];

export function serviceBySlug(slug: string) {
  return services.find((service) => service.slug === slug);
}

export const serviceHref = (service: Pick<Service, "slug">) =>
  `/services/${service.slug}`;
