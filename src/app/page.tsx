import type { ComponentType } from "react";
import Hero from "@/components/hero/Hero";
import Reveals from "@/components/motion/Reveals";
import Contact from "@/components/sections/Contact";
import Intro from "@/components/sections/Intro";
import Process from "@/components/sections/Process";
import Projects from "@/components/sections/Projects";
import Services from "@/components/sections/Services";
import Showcase from "@/components/sections/Showcase";
import Why from "@/components/sections/Why";
import { SHOW_PROJECTS } from "@/config/site";

type Chapter = {
  key: string;
  Component: ComponentType<{ index: string }>;
  numbered: boolean;
  enabled: boolean;
};

/**
 * The page is an ordered list of chapters. Disabled chapters are filtered out
 * before render, so they leave no DOM, no spacing and no scroll triggers behind —
 * and the remaining chapters renumber themselves.
 */
const chapters: Chapter[] = [
  { key: "intro", Component: Intro, numbered: true, enabled: true },
  { key: "services", Component: Services, numbered: true, enabled: true },
  { key: "showcase", Component: Showcase, numbered: false, enabled: true },
  {
    key: "projects",
    Component: Projects,
    numbered: true,
    enabled: SHOW_PROJECTS,
  },
  { key: "approach", Component: Process, numbered: true, enabled: true },
  { key: "why", Component: Why, numbered: true, enabled: true },
  { key: "contact", Component: Contact, numbered: true, enabled: true },
];

export default function Page() {
  let count = 0;
  const visible = chapters
    .filter((chapter) => chapter.enabled)
    .map((chapter) => ({
      ...chapter,
      index: chapter.numbered ? String(++count).padStart(2, "0") : "",
    }));

  return (
    <main id="main">
      <Hero />
      {visible.map(({ key, Component, index }) => (
        <Component key={key} index={index} />
      ))}
      {/* Mounted last so it runs after every chapter has hydrated. */}
      <Reveals />
    </main>
  );
}
