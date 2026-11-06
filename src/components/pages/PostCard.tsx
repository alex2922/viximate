import { ArrowUpRight } from "lucide-react";
import { services } from "@/config/site";
import { formatDate, type Post, postHref } from "@/content/posts";

/** What a post is filed under, in words. */
export function disciplineLabel(post: Pick<Post, "discipline">) {
  if (post.discipline === "system") return "The whole system";
  return services.find((s) => s.id === post.discipline)?.title ?? "";
}

type PostCardProps = {
  post: Post;
  /** The lead post on the blog index gets the wide card. */
  featured?: boolean;
  headingLevel?: "h2" | "h3";
};

/** A post as a poster in its discipline's colour: filed, title, line, date. */
export default function PostCard({
  post,
  featured = false,
  headingLevel: Heading = "h3",
}: PostCardProps) {
  return (
    <article
      className="post-card"
      data-featured={featured ? "" : undefined}
      data-discipline={post.discipline}
      data-reveal="up"
    >
      <a href={postHref(post)} className="post-card-link">
        <span className="post-card-art" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="caption post-card-filed">
          <span className="disc-swatch" aria-hidden="true" />
          {disciplineLabel(post)}
        </span>
        <Heading
          className={featured ? "h2 post-card-title" : "h3 post-card-title"}
        >
          {post.title}
        </Heading>
        <p className="body post-card-excerpt">{post.excerpt}</p>
        <span className="caption post-card-meta">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span>{post.minutes} min read</span>
        </span>
        <span className="post-card-arrow" aria-hidden="true">
          <ArrowUpRight size={18} strokeWidth={2} />
        </span>
      </a>
    </article>
  );
}
