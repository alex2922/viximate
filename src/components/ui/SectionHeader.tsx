import SplitText from "./SplitText";

type SectionHeaderProps = {
  title: string[];
  description?: string;
  id?: string;
};

/** The one section opening: the heading announces itself, one line beside it. */
export default function SectionHeader({
  title,
  description,
  id,
}: SectionHeaderProps) {
  return (
    <div className="section-head">
      <SplitText id={id} lines={title} className="h2 h2-cascade" fill />
      {description ? (
        <p
          className="lead text-muted section-head-line"
          data-reveal="up"
          data-reveal-delay="0.1"
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
