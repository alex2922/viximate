import type { ServiceId } from "@/config/site";

/**
 * Blog posts. Each body is a list of blocks so posts stay plain data: no
 * markdown parser ships with the page. Add a post by adding an entry here;
 * its page, its card and its place in the sitemap follow.
 */
export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "list"; items: string[] };

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  /** ISO date, shown as e.g. 21 October 2026. */
  date: string;
  minutes: number;
  /** The discipline the post is mostly about, for its colour and filter. */
  discipline: ServiceId | "system";
  body: Block[];
};

export const posts: Post[] = [
  {
    slug: "one-backbone",
    title: "Why your website, app and automations should share one backbone",
    excerpt:
      "Most businesses add tools one at a time until nothing talks to anything. Here is what changes when you design them as one system from the start.",
    date: "2026-10-28",
    minutes: 5,
    discipline: "system",
    body: [
      {
        type: "p",
        text: "It usually starts sensibly. A website from one agency, an app from a freelancer, a marketing team using whatever tools they know, and a few automations someone set up on a weekend. Each piece works. Together they leak: customers sign up twice, leads sit in an inbox, and nobody can say which campaign paid for itself.",
      },
      { type: "h2", text: "The cost is in the gaps" },
      {
        type: "p",
        text: "The problem is rarely any single tool. It is the hand-offs between them. Every time data is copied by hand, exported to a spreadsheet or retyped into a CRM, you pay twice: once in time, and again in mistakes that surface weeks later.",
      },
      {
        type: "list",
        items: [
          "One customer record, used by the website, the app and the sales team.",
          "One events plan, so a visit, a sign-up and a sale are measured the same way everywhere.",
          "One owner for the integrations, so a change in one tool does not quietly break another.",
        ],
      },
      { type: "h2", text: "Design the system before the screens" },
      {
        type: "p",
        text: "Before we design a page, we map where your data starts, where it needs to go and who acts on it. That map decides the stack. It is cheaper to agree on it at the start than to untangle it after launch.",
      },
      {
        type: "p",
        text: "You do not have to rebuild everything at once. Start with the hand-off that hurts most, connect it properly, and let each new piece plug into the same backbone.",
      },
    ],
  },
  {
    slug: "scoping-a-website",
    title: "How to scope a website project without paying for the wrong things",
    excerpt:
      "A good brief saves more money than a good negotiation. Six questions to answer before you ask anyone for a quote.",
    date: "2026-10-14",
    minutes: 4,
    discipline: "web",
    body: [
      {
        type: "p",
        text: "Two quotes for the same website can differ several times over, and both can be fair. They are usually pricing different projects, because the brief left too much open. Closing those gaps is the fastest way to a quote you can compare.",
      },
      { type: "h2", text: "Answer these first" },
      {
        type: "list",
        items: [
          "What should a visitor do on the site: call, book, buy, or sign up?",
          "Who will update the content after launch, and how often?",
          "Which systems must it connect to: payments, CRM, inventory, booking?",
          "How many distinct page types are there, not how many pages?",
          "Which languages and regions does it need to serve?",
          "What does success look like three months after launch?",
        ],
      },
      { type: "h2", text: "Spend where it compounds" },
      {
        type: "p",
        text: "Speed, search foundations and a CMS your team can actually use pay back every month. Elaborate animation on a page nobody visits does not. A good partner will tell you which is which, and show you where a smaller first version is the smarter buy.",
      },
      {
        type: "p",
        text: "If you are not sure of the answers, that is fine. A short discovery session is designed to find them, and it should leave you with a brief you could take to anyone.",
      },
    ],
  },
  {
    slug: "where-automation-pays",
    title: "Where AI automation pays off first in a growing business",
    excerpt:
      "Skip the chatbot demo. The first wins are usually quieter: the repetitive steps your team already resents.",
    date: "2026-09-30",
    minutes: 5,
    discipline: "ai",
    body: [
      {
        type: "p",
        text: "The most useful automation is rarely the most impressive one. It is the step that happens fifty times a week, follows the same rules each time, and pulls a skilled person away from work only they can do.",
      },
      { type: "h2", text: "Good first candidates" },
      {
        type: "list",
        items: [
          "Routing new enquiries to the right person, with a summary attached.",
          "Turning invoices, forms and emails into clean rows in your system.",
          "Following up leads that went quiet, at the right moment, in your voice.",
          "Drafting first replies to common support questions for a person to approve.",
        ],
      },
      { type: "h2", text: "Keep a person in the loop" },
      {
        type: "p",
        text: "Start with automations that draft, sort and suggest, and let your team approve. Once the output is consistently right, remove the approval step where it is safe to. Trust is earned one workflow at a time.",
      },
      {
        type: "p",
        text: "Measure before you build. Count how long the task takes today and how often it happens. That number tells you which automation to build first, and lets you check afterwards that it paid off.",
      },
    ],
  },
  {
    slug: "native-or-cross-platform",
    title: "Native, cross-platform or a web app: choosing how to build",
    excerpt:
      "The right choice depends on what the app must do on the device, how fast you need it, and who will maintain it.",
    date: "2026-09-16",
    minutes: 6,
    discipline: "app",
    body: [
      {
        type: "p",
        text: "There is no best way to build an app, only a best way for yours. The decision comes down to three things: what the app needs from the phone, how soon it must ship, and who will look after it in two years.",
      },
      { type: "h2", text: "A quick guide" },
      {
        type: "list",
        items: [
          "Web app: fastest to ship and update, works everywhere, limited access to the device.",
          "Cross-platform: one codebase for iOS and Android with near-native feel; the default for most products.",
          "Native: the deepest device access and the most polish, at the cost of two codebases.",
        ],
      },
      { type: "h2", text: "Questions that decide it" },
      {
        type: "p",
        text: "Does it need the camera, Bluetooth, background location or heavy offline use? Will it live in the stores, or is a link enough? Do you already have a web product it should share accounts and data with?",
      },
      {
        type: "p",
        text: "Whichever way you build, plan the backend as part of your wider system. An app that shares accounts and data with your website is worth more than a polished island.",
      },
    ],
  },
];

export const postBySlug = (slug: string) =>
  posts.find((post) => post.slug === slug);

export const postHref = (post: Pick<Post, "slug">) => `/blog/${post.slug}`;

/** 28 October 2026 */
export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}
