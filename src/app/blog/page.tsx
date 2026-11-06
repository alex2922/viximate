import type { Metadata } from "next";
import Reveals from "@/components/motion/Reveals";
import PageHead from "@/components/pages/PageHead";
import PostCard from "@/components/pages/PostCard";
import { posts } from "@/content/posts";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Notes from Viximate on building websites, apps, automation and growth that work as one system.",
};

export default function BlogPage() {
  const [lead, ...rest] = [...posts].sort((a, b) =>
    b.date.localeCompare(a.date),
  );

  return (
    <main id="main" tabIndex={-1}>
      <PageHead
        title={["Notes on building", "connected businesses."]}
        lead="Practical writing on websites, apps, automation and growth, and on making them work together."
        figure="notes"
      />

      <section aria-label="All posts" className="section blog-index">
        <div className="shell">
          <div className="blog-grid">
            <PostCard post={lead} featured headingLevel="h2" />
            {rest.map((post) => (
              <PostCard key={post.slug} post={post} headingLevel="h2" />
            ))}
          </div>
        </div>
      </section>

      <Reveals />
    </main>
  );
}
