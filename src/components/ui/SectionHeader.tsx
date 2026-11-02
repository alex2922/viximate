import SplitText from "./SplitText";

type SectionHeaderProps = {
  index: string;
  eyebrow: string;
  title: string[];
  description?: string;
  id?: string;
  accentWord?: string;
};

/** The single section recipe: eyebrow → heading → description. */
export default function SectionHeader({
  index,
  eyebrow,
  title,
  description,
  id,
  accentWord,
}: SectionHeaderProps) {
  return (
    <div className="grid gap-8 md:grid-cols-12 md:gap-6">
      <div className="md:col-span-3">
        <p className="eyebrow" data-reveal="up">
          <span>
            ({index}) {eyebrow}
          </span>
        </p>
      </div>
      <div className="md:col-span-9">
        <SplitText
          id={id}
          lines={title}
          className="h2"
          decorate={
            accentWord
              ? (word) =>
                  word.replace(/[.,]/g, "") === accentWord ? (
                    <span className="text-cs-accent">{word}</span>
                  ) : (
                    word
                  )
              : undefined
          }
        />
        {description ? (
          <p
            className="lead text-muted mt-8 max-w-[38ch]"
            data-reveal="up"
            data-reveal-delay="0.15"
          >
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
