import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Reveals from "@/components/motion/Reveals";
import PageHead from "@/components/pages/PageHead";
import PostCard, { disciplineLabel } from "@/components/pages/PostCard";
import { site } from "@/config/site";
import { type Block, formatDate, postBySlug, posts } from "@/content/posts";

// Unknown slugs fall through to notFound() below.
export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = postBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    authors: [{ name: `The ${site.name} team` }],
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      publishedTime: post.date,
    },
  };
}

function Body({ blocks }: { blocks: Block[] }) {
  return blocks.map((block, i) => {
    const key = i;
    if (block.type === "h2") return <h2 key={key}>{block.text}</h2>;
    if (block.type === "list")
      return (
        <ul key={key}>
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    return <p key={key}>{block.text}</p>;
  });
}

/** The params are read inside the boundary, so the route keeps a static shell. */
export default function PostPage({ params }: PageProps<"/blog/[slug]">) {
  return (
    <Suspense
      fallback={<main id="main" tabIndex={-1} className="page-pending" />}
    >
      <Post params={params} />
    </Suspense>
  );
}

async function Post({ params }: Pick<PageProps<"/blog/[slug]">, "params">) {
  const { slug } = await params;
  const post = postBySlug(slug);
  if (!post) notFound();

  const more = posts
    .filter((p) => p.slug !== post.slug)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 2);

  return (
    <main id="main" tabIndex={-1}>
      <article aria-labelledby="page-title" data-discipline={post.discipline}>
        <PageHead
          back={{ label: "All posts", href: "/blog" }}
          title={[post.title]}
          lead={post.excerpt}
          figure={post.discipline}
          meta={
            <p
              className="caption text-muted post-meta"
              data-discipline={post.discipline}
            >
              <span className="post-meta-filed">
                <span className="disc-swatch" aria-hidden="true" />
                {disciplineLabel(post)}
              </span>
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              <span>{post.minutes} min read</span>
              <span>By the {site.name} team</span>
            </p>
          }
        />
        <div className="shell">
          <div className="prose" data-reveal="up">
            <Body blocks={post.body} />
          </div>
        </div>
      </article>

      <section aria-labelledby="more-title" className="section">
        <div className="shell">
          <h2 id="more-title" className="h2" data-reveal="up">
            Keep reading
          </h2>
          <div className="blog-grid blog-grid--more">
            {more.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        </div>
      </section>

      <Reveals />
    </main>
  );
}
