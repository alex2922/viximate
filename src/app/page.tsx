import type { ComponentType } from "react";
import Hero from "@/components/hero/Hero";
import Reveals from "@/components/motion/Reveals";
import Intro from "@/components/sections/Intro";
import Journal from "@/components/sections/Journal";
import Projects from "@/components/sections/Projects";
import Services from "@/components/sections/Services";
import Showcase from "@/components/sections/Showcase";
import { SHOW_PROJECTS } from "@/config/site";

type Chapter = {
  key: string;
  Component: ComponentType;
  enabled: boolean;
};

/**
 * The page is an ordered list of chapters. Disabled chapters are filtered out
 * before render, so they leave no DOM, no spacing and no scroll triggers behind.
 */
const chapters: Chapter[] = [
  { key: "intro", Component: Intro, enabled: true },
  { key: "services", Component: Services, enabled: true },
  { key: "showcase", Component: Showcase, enabled: true },
  {
    key: "projects",
    Component: Projects,
    enabled: SHOW_PROJECTS,
  },
  { key: "journal", Component: Journal, enabled: true },
];

export default function Page() {
  const visible = chapters.filter((chapter) => chapter.enabled);

  return (
    <main id="main" tabIndex={-1}>
      <Hero />
      {visible.map(({ key, Component }) => (
        <Component key={key} />
      ))}
      {/* Mounted last so it runs after every chapter has hydrated. */}
      <Reveals />
    </main>
  );
}
