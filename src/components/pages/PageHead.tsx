import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import PageBlocks from "@/components/pages/PageBlocks";
import { Mark } from "@/components/ui/Logo";
import SplitText from "@/components/ui/SplitText";
import BlockArt from "@/components/visuals/BlockArt";
import type { FigureId } from "@/config/figures";

type PageHeadProps = {
  title: string[];
  lead: string;
  /** A way back up, e.g. to the services index. */
  back?: { label: string; href: string };
  /** What the blocks build beside the title. Left out, they build the mark. */
  figure?: FigureId;
  /** One line under the figure. */
  caption?: string;
  /** Small print under the lead: chips, a date, a reading time. */
  meta?: ReactNode;
};

/** The opening of every inner page: one h1, one sentence, one optional aside. */
export default function PageHead({
  title,
  lead,
  back,
  figure,
  caption,
  meta,
}: PageHeadProps) {
  return (
    <header className="page-head" data-blocks="">
      <PageBlocks figure={figure} />
      <div className="shell">
        {back ? (
          <a href={back.href} className="caption page-back" data-reveal="up">
            <ArrowLeft size={14} strokeWidth={2} aria-hidden="true" />
            <span className="link-line">{back.label}</span>
          </a>
        ) : null}
        <div className="page-head-grid" data-has-aside="">
          <div className="page-head-copy">
            <SplitText
              as="h1"
              id="page-title"
              lines={title}
              className="h1 page-title"
            />
            <p
              className="lead text-muted page-lead"
              data-reveal="up"
              data-reveal-delay="0.15"
            >
              {lead}
            </p>
            {meta ? (
              <div
                className="page-meta"
                data-reveal="up"
                data-reveal-delay="0.25"
              >
                {meta}
              </div>
            ) : null}
          </div>
          <figure className="page-figure" data-tone={figure}>
            <div
              className="page-figure-frame"
              data-blocks-frame=""
              data-cursor="label"
              data-cursor-label="Knock it"
            >
              {figure ? <BlockArt id={figure} /> : <Mark />}
            </div>
            {caption ? (
              <figcaption className="caption text-muted">{caption}</figcaption>
            ) : null}
          </figure>
        </div>
      </div>
    </header>
  );
}
