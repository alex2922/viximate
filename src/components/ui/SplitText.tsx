import type { ElementType, ReactNode } from "react";

type SplitTextProps = {
  /** Lines of text; each line is masked separately. */
  lines: string[];
  as?: ElementType;
  className?: string;
  id?: string;
  /** Optional per-word decorator, e.g. to colour a keyword. */
  decorate?: (word: string, lineIndex: number, wordIndex: number) => ReactNode;
  reveal?: boolean;
};

/**
 * Server-rendered split heading. Screen readers get the plain sentence;
 * the visual words are masked spans animated by <Reveals />.
 */
export default function SplitText({
  lines,
  as: Tag = "h2",
  className,
  id,
  decorate,
  reveal = true,
}: SplitTextProps) {
  const full = lines.join(" ");
  return (
    <Tag
      id={id}
      className={className}
      data-reveal={reveal ? "split" : undefined}
    >
      <span className="sr-only">{full}</span>
      <span aria-hidden="true">
        {lines.map((line, li) => (
          <span key={line} className="split-line">
            {line.split(" ").map((word, wi) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: words can repeat within a line
              <span key={`${word}-${wi}`} className="split-word">
                {decorate ? decorate(word, li, wi) : word}
                {wi < line.split(" ").length - 1 ? " " : ""}
              </span>
            ))}
          </span>
        ))}
      </span>
    </Tag>
  );
}
